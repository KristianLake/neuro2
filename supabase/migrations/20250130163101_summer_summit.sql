-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view achievements" ON achievements;
DROP POLICY IF EXISTS "Only admins can modify achievements" ON achievements;
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can earn achievements" ON user_achievements;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_user_achievements_user_id;
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;
DROP INDEX IF EXISTS idx_user_achievements_earned_at;

-- Create policies
CREATE POLICY "Everyone can view achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify achievements"
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

CREATE POLICY "Users can view own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

-- Update achievement data
INSERT INTO achievements (id, title, description, xp, icon, lesson_path) VALUES
-- Introduction Achievements
('first-program', 'First Program', 'Ran your first program successfully!', 50, '🚀', '/lessons/introduction'),
('hello-coder', 'Hello, Coder!', 'Started your coding journey with your first program', 25, '👋', '/lessons/introduction'),
('quick-learner', 'Quick Learner', 'Successfully ran code on your first try', 25, '⚡', '/lessons/introduction'),
('code-explorer', 'Code Explorer', 'Modified and ran the example code 3 times', 30, '🔍', '/lessons/introduction'),
('creative-coder', 'Creative Coder', 'Created a unique message using console.log', 35, '🎨', '/lessons/introduction'),
('personalized-hello', 'Making It Personal', 'Personalized your Hello World message', 20, '✨', '/lessons/introduction'),

-- Comment Achievements
('comment-master', 'Comment Master', 'Successfully used both single-line and multi-line comments', 30, '📝', '/learn/comments'),
('code-documenter', 'Code Documenter', 'Added helpful comments to explain your code', 25, '📚', '/learn/comments'),
('syntax-explorer', 'Syntax Explorer', 'Tried different comment styles and fixed common mistakes', 35, '🔍', '/learn/comments'),

-- Variables Achievements
('variable-master', 'Variable Master', 'Created and used your first variable successfully', 50, '📦', '/lessons/variables'),
('string-sage', 'String Sage', 'Successfully worked with text (string) variables', 25, '📝', '/lessons/variables'),
('number-ninja', 'Number Ninja', 'Mastered working with numeric variables', 25, '🔢', '/lessons/variables'),
('boolean-boss', 'Boolean Boss', 'Used true/false values in your code', 25, '✅', '/lessons/variables'),
('array-ace', 'Array Ace', 'Created and used an array to store multiple values', 35, '📚', '/lessons/variables'),
('object-expert', 'Object Expert', 'Successfully created and used an object with properties', 35, '🎯', '/lessons/variables'),
('name-wizard', 'Name Wizard', 'Used clear, descriptive variable names', 25, '✨', '/lessons/variables'),
('value-changer', 'Value Changer', 'Updated variable values after creating them', 30, '🔄', '/lessons/variables'),
('null-navigator', 'Null Navigator', 'Worked with null and undefined values correctly', 25, '❓', '/lessons/variables')
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  xp = EXCLUDED.xp,
  icon = EXCLUDED.icon,
  lesson_path = EXCLUDED.lesson_path,
  updated_at = now();

-- Grant permissions
GRANT SELECT ON achievements TO authenticated;
GRANT SELECT, INSERT ON user_achievements TO authenticated;