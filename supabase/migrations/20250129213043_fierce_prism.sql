-- Function to create a new session
CREATE OR REPLACE FUNCTION create_auth_session(
  p_user_id uuid,
  p_ip_address text,
  p_user_agent text,
  p_location jsonb,
  p_device_info jsonb
)
RETURNS uuid AS $$
DECLARE
  v_session_id uuid;
  v_user_settings jsonb;
  v_location_verified boolean;
BEGIN
  -- Get user's security settings
  SELECT security_settings INTO v_user_settings
  FROM users
  WHERE id = p_user_id;

  -- Check if location verification is required
  IF (v_user_settings->>'location_verification')::boolean THEN
    SELECT EXISTS (
      SELECT 1 FROM auth_locations
      WHERE user_id = p_user_id
      AND ip_address = p_ip_address
      AND is_verified = true
    ) INTO v_location_verified;

    IF NOT v_location_verified THEN
      -- Create verification attempt
      INSERT INTO auth_verification_attempts (
        user_id,
        verification_type,
        code,
        expires_at
      )
      VALUES (
        p_user_id,
        'location',
        substring(md5(random()::text) from 1 for 6),
        now() + interval '15 minutes'
      );

      RAISE EXCEPTION 'Location verification required';
    END IF;
  END IF;

  -- If single session is enabled, invalidate other sessions
  IF (v_user_settings->>'single_session')::boolean THEN
    UPDATE auth_sessions
    SET 
      is_active = false,
      expires_at = now()
    WHERE user_id = p_user_id
    AND is_active = true;

    -- Create notification for terminated sessions
    INSERT INTO auth_notifications (
      user_id,
      type,
      title,
      message,
      details
    )
    VALUES (
      p_user_id,
      'session_terminated',
      'Session Terminated',
      'Your previous session was terminated due to login from a new location',
      jsonb_build_object(
        'ip_address', p_ip_address,
        'location', p_location,
        'device_info', p_device_info
      )
    );
  END IF;

  -- Create new session
  INSERT INTO auth_sessions (
    user_id,
    token,
    ip_address,
    user_agent,
    location,
    device_info,
    expires_at
  )
  VALUES (
    p_user_id,
    encode(gen_random_bytes(32), 'hex'),
    p_ip_address,
    p_user_agent,
    p_location,
    p_device_info,
    now() + ((v_user_settings->>'session_duration')::integer || ' seconds')::interval
  )
  RETURNING id INTO v_session_id;

  -- Update user's last login
  UPDATE users
  SET 
    last_login_at = now(),
    failed_attempts = 0,
    locked_until = NULL
  WHERE id = p_user_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify location
CREATE OR REPLACE FUNCTION verify_auth_location(
  p_user_id uuid,
  p_verification_code text,
  p_ip_address text,
  p_location jsonb
)
RETURNS boolean AS $$
DECLARE
  v_attempt_record auth_verification_attempts%ROWTYPE;
  v_user_settings jsonb;
BEGIN
  -- Get user's security settings
  SELECT security_settings INTO v_user_settings
  FROM users
  WHERE id = p_user_id;

  -- Get verification attempt
  SELECT * INTO v_attempt_record
  FROM auth_verification_attempts
  WHERE user_id = p_user_id
  AND verification_type = 'location'
  AND verified_at IS NULL
  AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  -- Validate attempt exists and hasn't exceeded max attempts
  IF v_attempt_record IS NULL THEN
    RAISE EXCEPTION 'No valid verification attempt found';
  END IF;

  IF v_attempt_record.attempts >= (v_user_settings->>'max_verification_attempts')::integer THEN
    RAISE EXCEPTION 'Maximum verification attempts exceeded';
  END IF;

  -- Check verification code
  IF v_attempt_record.code = p_verification_code THEN
    -- Mark location as verified
    INSERT INTO auth_locations (
      user_id,
      ip_address,
      location,
      is_verified,
      verification_method,
      verified_at
    )
    VALUES (
      p_user_id,
      p_ip_address,
      p_location,
      true,
      'code',
      now()
    );

    -- Update verification attempt
    UPDATE auth_verification_attempts
    SET 
      verified_at = now()
    WHERE id = v_attempt_record.id;

    RETURN true;
  ELSE
    -- Increment attempts
    UPDATE auth_verification_attempts
    SET attempts = attempts + 1
    WHERE id = v_attempt_record.id;

    -- Create notification for failed attempt
    INSERT INTO auth_notifications (
      user_id,
      type,
      title,
      message,
      details
    )
    VALUES (
      p_user_id,
      'verification_failed',
      'Failed Verification Attempt',
      'A failed verification attempt was made from a new location',
      jsonb_build_object(
        'ip_address', p_ip_address,
        'location', p_location,
        'attempts', v_attempt_record.attempts + 1
      )
    );

    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(
  p_user_id uuid,
  p_ip_address text,
  p_location jsonb
)
RETURNS void AS $$
DECLARE
  v_user_settings jsonb;
BEGIN
  -- Get user's security settings
  SELECT security_settings INTO v_user_settings
  FROM users
  WHERE id = p_user_id;

  -- Update failed attempts
  UPDATE users
  SET 
    failed_attempts = failed_attempts + 1,
    locked_until = CASE 
      WHEN failed_attempts + 1 >= 5 THEN 
        now() + ((v_user_settings->>'verification_cooldown')::integer || ' seconds')::interval
      ELSE NULL
    END
  WHERE id = p_user_id;

  -- Create notification for failed login
  INSERT INTO auth_notifications (
    user_id,
    type,
    title,
    message,
    details
  )
  VALUES (
    p_user_id,
    'login_failed',
    'Failed Login Attempt',
    'A failed login attempt was detected from a new location',
    jsonb_build_object(
      'ip_address', p_ip_address,
      'location', p_location,
      'attempts', (SELECT failed_attempts FROM users WHERE id = p_user_id)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for suspicious activity
CREATE OR REPLACE FUNCTION check_suspicious_activity(
  p_user_id uuid,
  p_ip_address text,
  p_location jsonb,
  p_user_agent text
)
RETURNS jsonb AS $$
DECLARE
  v_suspicious boolean := false;
  v_reasons text[] := '{}';
  v_recent_locations jsonb[];
  v_recent_logins integer;
  v_user_timezone text;
BEGIN
  -- Get user's recent locations
  SELECT array_agg(location)
  INTO v_recent_locations
  FROM (
    SELECT DISTINCT location
    FROM auth_sessions
    WHERE user_id = p_user_id
    AND created_at > now() - interval '24 hours'
    ORDER BY created_at DESC
    LIMIT 5
  ) recent;

  -- Check for rapid location changes
  IF v_recent_locations IS NOT NULL AND 
     array_length(v_recent_locations, 1) > 3 THEN
    v_suspicious := true;
    v_reasons := array_append(v_reasons, 'rapid_location_changes');
  END IF;

  -- Check for multiple recent logins
  SELECT count(*)
  INTO v_recent_logins
  FROM auth_sessions
  WHERE user_id = p_user_id
  AND created_at > now() - interval '1 hour';

  IF v_recent_logins > 5 THEN
    v_suspicious := true;
    v_reasons := array_append(v_reasons, 'multiple_recent_logins');
  END IF;

  -- Check for unusual login time
  SELECT (security_settings->>'timezone')::text
  INTO v_user_timezone
  FROM users
  WHERE id = p_user_id;

  IF v_user_timezone IS NOT NULL AND 
     extract(hour from now() AT TIME ZONE v_user_timezone) BETWEEN 1 AND 5 THEN
    v_suspicious := true;
    v_reasons := array_append(v_reasons, 'unusual_login_time');
  END IF;

  -- If suspicious activity detected, create notification
  IF v_suspicious THEN
    INSERT INTO auth_notifications (
      user_id,
      type,
      title,
      message,
      details
    )
    VALUES (
      p_user_id,
      'suspicious_activity',
      'Suspicious Activity Detected',
      'Unusual login activity has been detected on your account',
      jsonb_build_object(
        'reasons', v_reasons,
        'ip_address', p_ip_address,
        'location', p_location,
        'user_agent', p_user_agent
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'suspicious', v_suspicious,
    'reasons', v_reasons
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;