-- Create achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  xp integer NOT NULL,
  icon text NOT NULL,
  lesson_path text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user achievements table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  achievement_id text REFERENCES achievements(id) NOT NULL,
  earned_at timestamptz DEFAULT now(),
  lesson_path text,
  UNIQUE(user_id, achievement_id)
);

-- Verify foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'user_achievements'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'user_achievements_achievement_id_fkey'
  ) THEN
    ALTER TABLE user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey
    FOREIGN KEY (achievement_id) REFERENCES achievements(id);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_v2 
ON user_achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id_v2 
ON user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at_v2 
ON user_achievements(earned_at DESC);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view achievements v2" ON achievements;
DROP POLICY IF EXISTS "Users can earn achievements v2" ON user_achievements;

-- Create policies
CREATE POLICY "Everyone can view achievements v2"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can earn achievements v2"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT ON achievements TO authenticated;
GRANT SELECT, INSERT ON user_achievements TO authenticated;