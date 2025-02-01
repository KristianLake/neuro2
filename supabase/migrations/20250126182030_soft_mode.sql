/*
  # Fix admin user detection in profile history

  1. Changes
    - Improve admin user detection logic
    - Add better error handling for header parsing
    - Add logging for debugging header issues
    - Ensure proper fallback to first admin user

  2. Security
    - Maintain RLS policies
    - Keep security definer setting
    - Validate UUID format for admin ID
*/

-- Create or replace function to track profile changes with proper admin detection
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
  _updater_id uuid;
  _updater_role text;
  _admin_header text;
  _raw_headers text;
BEGIN
  -- Get the user ID from auth.users
  _user_id := NEW.id;
  
  -- Get the updater info
  -- If using service role key, this is an admin update
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    -- For admin updates, set role to admin
    _updater_role := 'admin';
    
    -- Log raw headers for debugging
    BEGIN
      _raw_headers := current_setting('request.headers', true);
      RAISE DEBUG 'Raw headers: %', _raw_headers;
    EXCEPTION WHEN OTHERS THEN
      RAISE DEBUG 'Error getting raw headers: %', SQLERRM;
    END;
    
    -- Try to get admin ID from custom header with better error handling
    BEGIN
      _admin_header := current_setting('request.headers', true)::json->>'x-admin-user-id';
      RAISE DEBUG 'Admin header value: %', _admin_header;
      
      IF _admin_header IS NOT NULL AND _admin_header ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        -- Verify this admin user exists
        SELECT id INTO _updater_id
        FROM public.users
        WHERE id = _admin_header::uuid AND role = 'admin';
        
        IF _updater_id IS NULL THEN
          RAISE DEBUG 'Admin user from header not found or not admin: %', _admin_header;
          -- Fallback to first admin
          SELECT id INTO _updater_id
          FROM public.users
          WHERE role = 'admin'
          ORDER BY created_at ASC
          LIMIT 1;
        END IF;
      ELSE
        RAISE DEBUG 'Invalid or missing admin header: %', _admin_header;
        -- Fallback to first admin
        SELECT id INTO _updater_id
        FROM public.users
        WHERE role = 'admin'
        ORDER BY created_at ASC
        LIMIT 1;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE DEBUG 'Error processing admin header: %', SQLERRM;
      -- Fallback to first admin
      SELECT id INTO _updater_id
      FROM public.users
      WHERE role = 'admin'
      ORDER BY created_at ASC
      LIMIT 1;
    END;
    
    -- If we still don't have an updater_id, raise a warning
    IF _updater_id IS NULL THEN
      RAISE WARNING 'Could not determine admin user for update, no admin users found';
      -- But still allow the update to proceed
      _updater_id := NEW.id;
    END IF;
  ELSE
    -- Regular user update
    _updater_id := auth.uid();
    _updater_role := 'user';
  END IF;

  -- Track full_name changes
  IF (OLD.raw_user_meta_data->>'full_name') IS DISTINCT FROM (NEW.raw_user_meta_data->>'full_name') THEN
    INSERT INTO public.profile_history (
      user_id,
      field_name,
      old_value,
      new_value,
      updater_id,
      updater_role
    )
    VALUES (
      _user_id,
      'full_name',
      OLD.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'full_name',
      _updater_id,
      _updater_role
    );
  END IF;

  -- Update public.users metadata
  UPDATE public.users
  SET
    user_metadata = NEW.raw_user_meta_data,
    updated_at = now()
  WHERE id = _user_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Error in track_profile_changes: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;