-- Add logging table for access issues
CREATE TABLE IF NOT EXISTS access_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  purchase_id uuid REFERENCES purchases(id),
  module_id text,
  issue_type text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE access_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can view audit logs"
  ON access_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Function to audit access issues
CREATE OR REPLACE FUNCTION log_access_issue(
  p_user_id uuid,
  p_purchase_id uuid,
  p_module_id text,
  p_issue_type text,
  p_details jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO access_audit_log (
    user_id,
    purchase_id,
    module_id,
    issue_type,
    details
  ) VALUES (
    p_user_id,
    p_purchase_id,
    p_module_id,
    p_issue_type,
    p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and fix course access
CREATE OR REPLACE FUNCTION check_and_fix_course_access(
  p_user_id uuid,
  p_module_id text
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_purchase_record record;
  v_access_record record;
  v_product_type text;
  v_has_valid_purchase boolean;
  v_has_access boolean;
  v_fixed boolean := false;
BEGIN
  -- Initialize result
  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'module_id', p_module_id,
    'checked_at', now(),
    'issues_found', false,
    'issues_fixed', false,
    'details', jsonb_build_object()
  );

  -- Check for valid purchase
  SELECT EXISTS (
    SELECT 1 
    FROM purchases p
    WHERE p.user_id = p_user_id
    AND p.status = 'completed'
    AND (
      p.product_id = p_module_id OR
      (p.product_id LIKE 'full-course%' AND p_module_id LIKE 'module-%')
    )
  ) INTO v_has_valid_purchase;

  -- Check current access
  SELECT EXISTS (
    SELECT 1 
    FROM course_access ca
    WHERE ca.user_id = p_user_id
    AND ca.module_id = p_module_id
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
  ) INTO v_has_access;

  -- Log current state
  v_result := v_result || jsonb_build_object(
    'current_state', jsonb_build_object(
      'has_valid_purchase', v_has_valid_purchase,
      'has_access', v_has_access
    )
  );

  -- Check for issues
  IF v_has_valid_purchase AND NOT v_has_access THEN
    -- Issue found: Missing access for valid purchase
    v_result := v_result || jsonb_build_object('issues_found', true);
    
    -- Get purchase details
    SELECT p.*, pr.type
    INTO v_purchase_record
    FROM purchases p
    JOIN products pr ON pr.id = p.product_id
    WHERE p.user_id = p_user_id
    AND p.status = 'completed'
    AND (
      p.product_id = p_module_id OR
      (p.product_id LIKE 'full-course%' AND p_module_id LIKE 'module-%')
    )
    ORDER BY p.created_at DESC
    LIMIT 1;

    -- Log the issue
    PERFORM log_access_issue(
      p_user_id,
      v_purchase_record.id,
      p_module_id,
      'missing_access',
      jsonb_build_object(
        'purchase_id', v_purchase_record.id,
        'product_id', v_purchase_record.product_id,
        'product_type', v_purchase_record.type,
        'purchase_date', v_purchase_record.created_at
      )
    );

    -- Fix the access
    IF v_purchase_record.type = 'module' THEN
      INSERT INTO course_access (user_id, module_id)
      VALUES (p_user_id, p_module_id)
      ON CONFLICT (user_id, module_id) DO NOTHING;
    ELSIF v_purchase_record.type = 'course' THEN
      INSERT INTO course_access (user_id, module_id)
      SELECT 
        p_user_id,
        'module-' || generate_series(1, 9)
      ON CONFLICT (user_id, module_id) DO NOTHING;
    END IF;

    v_fixed := true;
  ELSIF NOT v_has_valid_purchase AND v_has_access THEN
    -- Issue found: Access without valid purchase
    v_result := v_result || jsonb_build_object('issues_found', true);
    
    -- Get access record
    SELECT *
    INTO v_access_record
    FROM course_access
    WHERE user_id = p_user_id
    AND module_id = p_module_id;

    -- Log the issue
    PERFORM log_access_issue(
      p_user_id,
      NULL,
      p_module_id,
      'unauthorized_access',
      jsonb_build_object(
        'access_granted_at', v_access_record.created_at,
        'expires_at', v_access_record.expires_at
      )
    );

    -- Remove unauthorized access
    DELETE FROM course_access
    WHERE user_id = p_user_id
    AND module_id = p_module_id;

    v_fixed := true;
  END IF;

  -- Update result with fix status
  v_result := v_result || jsonb_build_object(
    'issues_fixed', v_fixed,
    'details', jsonb_build_object(
      'access_status', check_course_access(p_user_id, p_module_id)
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_and_fix_course_access TO authenticated;
GRANT EXECUTE ON FUNCTION log_access_issue TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_access_audit_log_user_module 
ON access_audit_log(user_id, module_id);

-- Create index for expires_at queries
CREATE INDEX IF NOT EXISTS idx_course_access_expires_at
ON course_access(expires_at)
WHERE expires_at IS NOT NULL;