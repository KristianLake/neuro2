/*
  # Add profile history tracking

  1. Changes
    - Add profile_history table to track user profile updates
    - Create trigger to record profile changes
    - Add policies for admin access
*/

-- Create profile history table
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

-- Create policies
CREATE POLICY "Admins can read profile history"
  ON profile_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  ));

-- Create function to track profile changes
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  old_meta jsonb := OLD.user_metadata;
  new_meta jsonb := NEW.user_metadata;
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

-- Create trigger for profile updates
CREATE TRIGGER on_profile_update
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.user_metadata IS DISTINCT FROM NEW.user_metadata)
  EXECUTE FUNCTION track_profile_changes();