-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id
ON purchases(user_id);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can create own purchases" ON purchases;
DROP POLICY IF EXISTS "Only admins can update purchases" ON purchases;

CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can create own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create function to manage course access
CREATE OR REPLACE FUNCTION manage_course_access(
  p_user_id uuid,
  p_module_id text,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- Insert or update course access
  INSERT INTO course_access (user_id, module_id, expires_at)
  VALUES (p_user_id, p_module_id, p_expires_at)
  ON CONFLICT (user_id, module_id) 
  DO UPDATE SET 
    expires_at = p_expires_at,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to revoke course access
CREATE OR REPLACE FUNCTION revoke_course_access(
  p_user_id uuid,
  p_module_id text
)
RETURNS void AS $$
BEGIN
  DELETE FROM course_access
  WHERE user_id = p_user_id
  AND module_id = p_module_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add expires_at column to course_access if it doesn't exist
ALTER TABLE course_access 
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Create index on expires_at for better performance
CREATE INDEX IF NOT EXISTS idx_course_access_expires_at
ON course_access(expires_at);

-- Grant necessary permissions
GRANT SELECT ON purchases TO authenticated;
GRANT INSERT ON purchases TO authenticated;
GRANT EXECUTE ON FUNCTION manage_course_access TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_course_access TO authenticated;