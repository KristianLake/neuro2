-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

-- Create policies for audit logs
CREATE POLICY "Everyone can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT INSERT ON audit_logs TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;