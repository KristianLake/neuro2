/*
  # Fix profile history relationships

  1. Changes
    - Add foreign key relationship for updater_id
    - Add RLS policy for updater relationship
    - Update profile history view permissions
  
  2. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Add foreign key relationship if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profile_history_updater_id_fkey'
  ) THEN
    ALTER TABLE profile_history 
    ADD CONSTRAINT profile_history_updater_id_fkey 
    FOREIGN KEY (updater_id) 
    REFERENCES auth.users(id);
  END IF;
END $$;

-- Update RLS policies
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can read profile history" ON profile_history;
DROP POLICY IF EXISTS "Users can read own profile history" ON profile_history;

-- Create new policies
CREATE POLICY "Users can read own profile history"
  ON profile_history
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON profile_history TO authenticated;
GRANT SELECT ON users TO authenticated;