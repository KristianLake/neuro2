/*
  # Access History and Management Updates

  1. New Tables
    - `course_access_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `module_id` (text)
      - `action` (text: 'granted' | 'revoked' | 'extended')
      - `admin_id` (uuid, references users)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on new table
    - Add policy for admin access
    - Add policy for user access

  3. Functions
    - Add function to manage course access with history tracking
    - Add function to revoke course access with history tracking
*/

-- Create course access history table
CREATE TABLE course_access_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  module_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('granted', 'revoked', 'extended')),
  admin_id uuid REFERENCES users(id) NOT NULL,
  expires_at timestamptz,
  previous_expiry timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_access_history ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can view access history"
  ON course_access_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_course_access_history_user_id 
  ON course_access_history(user_id);
CREATE INDEX idx_course_access_history_admin_id 
  ON course_access_history(admin_id);
CREATE INDEX idx_course_access_history_created_at 
  ON course_access_history(created_at DESC);

-- Drop existing manage_course_access function if it exists
DROP FUNCTION IF EXISTS manage_course_access(uuid, text, timestamptz);

-- Create improved manage_course_access function
CREATE OR REPLACE FUNCTION manage_course_access(
  p_user_id uuid,
  p_module_id text,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  _admin_id uuid;
  _previous_expiry timestamptz;
  _action text;
BEGIN
  -- Get admin ID
  _admin_id := auth.uid();
  
  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = _admin_id
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can manage course access';
  END IF;

  -- Get previous expiry if exists
  SELECT expires_at INTO _previous_expiry
  FROM course_access
  WHERE user_id = p_user_id
  AND module_id = p_module_id;

  -- Determine action type
  IF _previous_expiry IS NULL THEN
    _action := 'granted';
  ELSE
    _action := 'extended';
  END IF;

  -- Insert or update course access
  INSERT INTO course_access (user_id, module_id, expires_at)
  VALUES (p_user_id, p_module_id, p_expires_at)
  ON CONFLICT (user_id, module_id) 
  DO UPDATE SET 
    expires_at = p_expires_at,
    updated_at = now();

  -- Record history
  INSERT INTO course_access_history (
    user_id,
    module_id,
    action,
    admin_id,
    expires_at,
    previous_expiry
  )
  VALUES (
    p_user_id,
    p_module_id,
    _action,
    _admin_id,
    p_expires_at,
    _previous_expiry
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing revoke_course_access function if it exists
DROP FUNCTION IF EXISTS revoke_course_access(uuid, text);

-- Create improved revoke_course_access function
CREATE OR REPLACE FUNCTION revoke_course_access(
  p_user_id uuid,
  p_module_id text
)
RETURNS void AS $$
DECLARE
  _admin_id uuid;
  _previous_expiry timestamptz;
BEGIN
  -- Get admin ID
  _admin_id := auth.uid();
  
  -- Check if admin
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = _admin_id
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can revoke course access';
  END IF;

  -- Get previous expiry before deletion
  SELECT expires_at INTO _previous_expiry
  FROM course_access
  WHERE user_id = p_user_id
  AND module_id = p_module_id;

  -- Delete access
  DELETE FROM course_access
  WHERE user_id = p_user_id
  AND module_id = p_module_id;

  -- Record history
  INSERT INTO course_access_history (
    user_id,
    module_id,
    action,
    admin_id,
    expires_at,
    previous_expiry
  )
  VALUES (
    p_user_id,
    p_module_id,
    'revoked',
    _admin_id,
    NULL,
    _previous_expiry
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON course_access_history TO authenticated;
GRANT EXECUTE ON FUNCTION manage_course_access TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_course_access TO authenticated;