/*
  # Fix admin tracking in profile history

  1. Changes
    - Properly handle service role updates
    - Track admin user ID from request headers
    - Set correct updater role
    - Improve error handling and logging

  2. Security
    - Maintain RLS policies
    - Keep security definer setting
    - Preserve existing permissions
*/

-- Create or replace function to track profile changes with improved admin tracking
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
  _updater_id uuid;
  _updater_role text;
  _admin_header text;
BEGIN
  -- Get the user ID from auth.users
  _user_id := NEW.id;
  
  -- Get the updater info
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    -- For admin updates via service role, try to get admin ID from header
    BEGIN
      _admin_header := current_setting('request.headers', true)::json->>'x-admin-user-id';
      
      IF _admin_header IS NOT NULL THEN
        -- Verify this is a valid admin user
        SELECT id INTO _updater_id
        FROM public.users
        WHERE id = _admin_header::uuid AND role = 'admin';
        
        IF _updater_id IS NOT NULL THEN
          _updater_role := 'admin';
        END IF;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log header processing error but continue
      RAISE WARNING 'Error processing admin header: %', SQLERRM;
    END;
  ELSE
    -- Regular user update
    _updater_id := auth.uid();
    
    -- Get role from users table
    SELECT role INTO _updater_role
    FROM public.users
    WHERE id = _updater_id;
  END IF;
  
  -- Set defaults if needed
  IF _updater_id IS NULL THEN
    _updater_id := _user_id;
  END IF;
  
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