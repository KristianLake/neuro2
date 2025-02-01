-- Verify achievements table structure
DO $$ 
BEGIN
  -- Check if achievements table exists and has correct structure
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'achievements'
  ) THEN
    RAISE NOTICE 'Creating achievements table';
    CREATE TABLE achievements (
      id text PRIMARY KEY,
      title text NOT NULL,
      description text NOT NULL,
      xp integer NOT NULL,
      icon text NOT NULL,
      lesson_path text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;

  -- Check if user_achievements table exists and has correct structure
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'user_achievements'
  ) THEN
    RAISE NOTICE 'Creating user_achievements table';
    CREATE TABLE user_achievements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      achievement_id text REFERENCES achievements(id) NOT NULL,
      earned_at timestamptz DEFAULT now(),
      lesson_path text,
      UNIQUE(user_id, achievement_id)
    );
  END IF;

  -- Verify foreign key constraints
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'user_achievements'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'user_achievements_achievement_id_fkey'
  ) THEN
    RAISE NOTICE 'Adding foreign key constraint for achievement_id';
    ALTER TABLE user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey
    FOREIGN KEY (achievement_id) REFERENCES achievements(id);
  END IF;

  -- Verify indexes exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'user_achievements'
    AND indexname = 'idx_user_achievements_user_id_v2'
  ) THEN
    RAISE NOTICE 'Creating user_id index';
    CREATE INDEX idx_user_achievements_user_id_v2 
    ON user_achievements(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'user_achievements'
    AND indexname = 'idx_user_achievements_achievement_id_v2'
  ) THEN
    RAISE NOTICE 'Creating achievement_id index';
    CREATE INDEX idx_user_achievements_achievement_id_v2 
    ON user_achievements(achievement_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'user_achievements'
    AND indexname = 'idx_user_achievements_earned_at_v2'
  ) THEN
    RAISE NOTICE 'Creating earned_at index';
    CREATE INDEX idx_user_achievements_earned_at_v2 
    ON user_achievements(earned_at DESC);
  END IF;

  -- Verify RLS is enabled
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'user_achievements'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE 'Enabling RLS on user_achievements';
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE tablename = 'achievements'
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE 'Enabling RLS on achievements';
    ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Verify policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'achievements' 
    AND policyname = 'Everyone can view achievements v2'
  ) THEN
    CREATE POLICY "Everyone can view achievements v2"
      ON achievements
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'Users can earn achievements v2'
  ) THEN
    CREATE POLICY "Users can earn achievements v2"
      ON user_achievements
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Grant necessary permissions
  GRANT SELECT ON achievements TO authenticated;
  GRANT SELECT, INSERT ON user_achievements TO authenticated;

  -- Log table structure
  RAISE NOTICE 'Achievement tables verified successfully';
  RAISE NOTICE 'Tables and policies are properly configured';
END $$;