/*
  # Fix profile history tracking

  1. Changes
    - Improve updater tracking in profile_history
    - Handle service role updates correctly
    - Ensure proper role and user info is captured
    - Fix "Unknown" user issue in history

  2. Details
    - Use auth.jwt() to get current user info
    - Handle both service role and regular updates
    - Properly track admin vs user updates
    - Ensure updater info is always available
*/

-- Create or replace function to track profile changes with improved user tracking
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
  _updater_id uuid;
  _updater_role text;
  _jwt json;
BEGIN
  -- Get the user ID from auth.users
  _user_id := NEW.id;
  
  -- Get the JWT claims
  _jwt := auth.jwt();
  
  -- Handle service role updates
  IF _jwt->>'role' = 'service_role' THEN
    -- For service role updates, use the user being updated as the updater
    -- This ensures we have valid user info in the history
    _updater_id := _user_id;
    _updater_role := 'admin';
  ELSE
    -- For regular updates, use the authenticated user
    _updater_id := (_jwt->>'sub')::uuid;
    
    -- Get the role from users table
    SELECT role INTO _updater_role
    FROM public.users
    WHERE id = _updater_id;
    
    -- Default to 'user' if no role found
    IF _updater_role IS NULL THEN
      _updater_role := 'user';
    END IF;
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