/*
  # Simplify admin user tracking in profile history

  1. Changes
    - Simplify admin user detection
    - Remove complex header parsing
    - Use auth.uid() for all user identification
    - Add better error handling

  2. Security
    - Maintain RLS policies
    - Keep security definer setting
*/

-- Create or replace function to track profile changes with simplified admin tracking
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
  _updater_id uuid;
  _updater_role text;
BEGIN
  -- Get the user ID from auth.users
  _user_id := NEW.id;
  
  -- Get the updater info using auth.uid()
  _updater_id := auth.uid();
  
  -- Determine if the updater is an admin
  SELECT role INTO _updater_role
  FROM public.users
  WHERE id = _updater_id;
  
  -- If no role found (shouldn't happen), default to 'user'
  IF _updater_role IS NULL THEN
    _updater_role := 'user';
  END IF;

  -- Track full_name changes
  IF (OLD.raw_user_meta_data->>'full_name') IS DISTINCT FROM (NEW.raw_user_meta_data->>'full_name') THEN
    INSERT INTO public.profile_history (
      user_id,
      field_name,
      old_value,
      new_value,
      updater_id,
      updater_role
    )
    VALUES (
      _user_id,
      'full_name',
      OLD.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'full_name',
      _updater_id,
      _updater_role
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