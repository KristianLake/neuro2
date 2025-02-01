-- Drop existing policies first
DROP POLICY IF EXISTS "Everyone can view achievements v3" ON achievements;
DROP POLICY IF EXISTS "Only admins can modify achievements v3" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements v3" ON user_achievements;
DROP POLICY IF EXISTS "Users can earn achievements v3" ON user_achievements;
DROP POLICY IF EXISTS "Users can delete own achievements" ON user_achievements;

-- Create policies with unique names
CREATE POLICY "Everyone can view achievements v4"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify achievements v4"
  ON achievements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own achievements v4"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements v4"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add new policy to allow users to delete their own achievements
CREATE POLICY "Users can delete own achievements v4"
  ON user_achievements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant additional DELETE permission
GRANT DELETE ON user_achievements TO authenticated;