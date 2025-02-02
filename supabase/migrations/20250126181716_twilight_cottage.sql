-- Create or replace function to track profile changes with proper admin detection
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
  _updater_id uuid;
  _updater_role text;
BEGIN
  -- Get the user ID from auth.users
  _user_id := NEW.id;
  
  -- Get the updater info
  -- If using service role key, this is an admin update
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    -- For admin updates, set role to admin
    _updater_role := 'admin';
    -- Get the user ID from the users table where role is admin
    SELECT id INTO _updater_id
    FROM public.users
    WHERE role = 'admin'
    LIMIT 1;
  ELSE
    -- Regular user update
    _updater_id := auth.uid();
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