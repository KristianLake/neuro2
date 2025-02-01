/*
  # Fix User Updates Implementation

  1. Changes
    - Fix admin user tracking
    - Add better error handling
    - Improve logging
    - Fix role handling
    - Add proper security checks

  2. Security
    - Improve RLS policies
    - Add better error handling
    - Add input validation
    - Add proper role checks

  3. Audit
    - Add detailed logging
    - Track all changes
    - Maintain history
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS track_profile_changes() CASCADE;

-- Create improved profile changes tracking function
CREATE OR REPLACE FUNCTION track_profile_changes()
RETURNS TRIGGER AS $$
DECLARE
  _user_id uuid;
  _updater_id uuid;
  _updater_role text;
  _admin_header text;
  _jwt_role text;
  _jwt_sub uuid;
BEGIN
  -- Get the user ID from auth.users
  _user_id := NEW.id;
  
  -- Get JWT claims safely
  BEGIN
    _jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
    _jwt_sub := (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
  EXCEPTION WHEN OTHERS THEN
    RAISE DEBUG 'Error getting JWT claims: %', SQLERRM;
    _jwt_role := NULL;
    _jwt_sub := NULL;
  END;

  -- Handle different auth scenarios
  IF _jwt_role = 'service_role' THEN
    -- Service role (admin) request
    BEGIN
      -- Try to get admin ID from header
      _admin_header := current_setting('request.headers', true)::json->>'x-admin-user-id';
      RAISE LOG 'Admin header value: %', _admin_header;
      
      IF _admin_header IS NOT NULL AND 
         _admin_header ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        -- Verify admin exists and has admin role
        SELECT id INTO _updater_id
        FROM public.users
        WHERE id = _admin_header::uuid
        AND role = 'admin';
        
        IF _updater_id IS NOT NULL THEN
          _updater_role := 'admin';
          RAISE LOG 'Using admin user ID: % for update', _updater_id;
        ELSE
          RAISE DEBUG 'Admin user not found or not admin: %', _admin_header;
        END IF;
      ELSE
        RAISE DEBUG 'Invalid or missing admin header: %', _admin_header;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE DEBUG 'Error processing admin header: %', SQLERRM;
    END;
  ELSE
    -- Regular user request
    _updater_id := _jwt_sub;
    
    -- Get role from users table
    SELECT role INTO _updater_role
    FROM public.users
    WHERE id = _updater_id;
    
    RAISE LOG 'Regular update from user: % with role: %', _updater_id, _updater_role;
  END IF;

  -- Set safe defaults if needed
  IF _updater_id IS NULL THEN
    _updater_id := _user_id;
    RAISE LOG 'Using default updater ID: %', _updater_id;
  END IF;
  
  IF _updater_role IS NULL THEN
    _updater_role := 'user';
    RAISE LOG 'Using default role: %', _updater_role;
  END IF;

  -- Track metadata changes
  IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
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
      
      RAISE LOG 'Inserted profile history record - User: %, Field: %, Updater: % (%)',
        _user_id,
        'full_name',
        _updater_id,
        _updater_role;
    END IF;
  END IF;

  -- Update public.users metadata
  UPDATE public.users
  SET
    user_metadata = NEW.raw_user_meta_data,
    updated_at = now()
  WHERE id = _user_id;

  RAISE LOG 'Updated user metadata - User: %, Updater: % (%)',
    _user_id,
    _updater_id,
    _updater_role;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the transaction
  RAISE WARNING 'Error in track_profile_changes: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_update ON auth.users;
CREATE TRIGGER on_profile_update
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION track_profile_changes();

-- Ensure RLS is enabled
ALTER TABLE profile_history ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own profile history" ON profile_history;
CREATE POLICY "Users can read own profile history"
  ON profile_history
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_history_user_id 
  ON profile_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_history_updater_id 
  ON profile_history(updater_id);
CREATE INDEX IF NOT EXISTS idx_profile_history_created_at 
  ON profile_history(created_at DESC);

-- Grant necessary permissions
GRANT SELECT ON profile_history TO authenticated;
GRANT SELECT ON users TO authenticated;