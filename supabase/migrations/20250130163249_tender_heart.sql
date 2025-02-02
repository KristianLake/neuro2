-- Drop existing policies first
DROP POLICY IF EXISTS "Everyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Only admins can modify achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can earn achievements" ON user_achievements;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;
DROP INDEX IF EXISTS idx_user_achievements_earned_at;

-- Create policies
CREATE POLICY "Everyone can view achievements v2"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify achievements v2"
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

CREATE POLICY "Users can view own achievements v2"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements v2"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_v2 
ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id_v2 
ON user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at_v2 
ON user_achievements(earned_at DESC);

-- Update achievement data
UPDATE achievements SET updated_at = now()
WHERE id IN (
  'first-program',
  'hello-coder',
  'quick-learner',
  'code-explorer',
  'creative-coder',
  'personalized-hello',
  'comment-master',
  'code-documenter',
  'syntax-explorer',
  'variable-master',
  'string-sage',
  'number-ninja',
  'boolean-boss',
  'array-ace',
  'object-expert',
  'name-wizard',
  'value-changer',
  'null-navigator'
);

-- Grant permissions
GRANT SELECT ON achievements TO authenticated;
GRANT SELECT, INSERT ON user_achievements TO authenticated;