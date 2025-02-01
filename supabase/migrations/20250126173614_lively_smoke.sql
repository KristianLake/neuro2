/*
  # Profile History Updates
  
  1. Changes
    - Create profile history table if not exists
    - Add trigger to track profile changes from auth.users
    - Track full_name changes in user metadata
  
  2. Security
    - Enable RLS
    - Add admin-only read policy
*/

-- Create profile history table if not exists
CREATE TABLE IF NOT EXISTS profile_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can read profile history" ON profile_history;

-- Create policy
CREATE POLICY "Admins can read profile history"
  ON profile_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Create or replace function to track profile changes
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_meta jsonb := OLD.raw_user_meta_data;
  new_meta jsonb := NEW.raw_user_meta_data;
  key text;
BEGIN
  -- Check for changes in full_name
  IF old_meta->>'full_name' IS DISTINCT FROM new_meta->>'full_name' THEN
    INSERT INTO profile_history (user_id, field_name, old_value, new_value)
    VALUES (NEW.id, 'full_name', old_meta->>'full_name', new_meta->>'full_name');
  END IF;

  -- Add more fields to track here as needed

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_profile_update ON auth.users;

-- Create trigger for profile updates
CREATE TRIGGER on_profile_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION track_profile_changes();