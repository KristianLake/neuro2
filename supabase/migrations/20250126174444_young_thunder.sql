/*
  # Fix Profile Tracking and Permissions

  1. Changes
    - Fix trigger function to properly handle auth.users updates
    - Add proper error handling
    - Ensure proper permissions
    - Clean up redundant triggers
    - Add proper indexes for performance

  2. Security
    - Ensure proper RLS policies
    - Add proper error handling
    - Fix permission issues
*/

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_profile_update ON auth.users CASCADE;

-- Create or replace function to track profile changes
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
BEGIN
  -- Get the user ID from auth.users
  _user_id := NEW.id;

  -- Track full_name changes
  IF (OLD.raw_user_meta_data->>'full_name') IS DISTINCT FROM (NEW.raw_user_meta_data->>'full_name') THEN
    INSERT INTO public.profile_history (
      user_id,
      field_name,
      old_value,
      new_value
    )
    VALUES (
      _user_id,
      'full_name',
      OLD.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'full_name'
    );
  END IF;

  -- Update public.users metadata
  UPDATE public.users
  SET
    user_metadata = NEW.raw_user_meta_data,
    updated_at = now()
  WHERE id = _user_id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Error in track_profile_changes: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger with proper error handling
CREATE TRIGGER on_profile_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION track_profile_changes();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profile_history_user_id ON profile_history(user_id);

-- Ensure RLS is enabled
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Admins can read profile history" ON profile_history;
CREATE POLICY "Admins can read profile history"
  ON profile_history
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
GRANT SELECT ON profile_history TO authenticated;
GRANT INSERT ON profile_history TO authenticated;