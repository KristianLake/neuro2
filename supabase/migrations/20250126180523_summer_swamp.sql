-- Drop existing foreign key if it exists
ALTER TABLE profile_history 
DROP CONSTRAINT IF EXISTS profile_history_updater_id_fkey;

-- Add foreign key to public.users
ALTER TABLE profile_history 
ADD CONSTRAINT profile_history_updater_id_fkey 
FOREIGN KEY (updater_id) 
REFERENCES public.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profile_history_updater_id 
ON profile_history(updater_id);

-- Update RLS policies
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
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

-- Add explicit foreign key for user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profile_history_user_id_fkey'
  ) THEN
    ALTER TABLE profile_history 
    ADD CONSTRAINT profile_history_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users(id);
  END IF;
END $$;