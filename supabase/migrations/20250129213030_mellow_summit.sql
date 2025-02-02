-- Create auth_sessions table
CREATE TABLE auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token text NOT NULL,
  ip_address text NOT NULL,
  user_agent text,
  location jsonb,
  device_info jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz DEFAULT now()
);

-- Create auth_locations table
CREATE TABLE auth_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  ip_address text NOT NULL,
  location jsonb NOT NULL,
  is_verified boolean DEFAULT false,
  verification_method text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create auth_verification_attempts table
CREATE TABLE auth_verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  verification_type text NOT NULL,
  code text NOT NULL,
  attempts integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create auth_notifications table
CREATE TABLE auth_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  details jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add columns to users table for auth settings
ALTER TABLE users
ADD COLUMN IF NOT EXISTS mfa_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mfa_method text,
ADD COLUMN IF NOT EXISTS registration_ip text,
ADD COLUMN IF NOT EXISTS registration_location jsonb,
ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
ADD COLUMN IF NOT EXISTS failed_attempts integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until timestamptz,
ADD COLUMN IF NOT EXISTS security_settings jsonb DEFAULT '{
  "single_session": true,
  "location_verification": true,
  "notification_email": true,
  "notification_sms": false,
  "max_verification_attempts": 3,
  "verification_cooldown": 900,
  "session_duration": 3600
}'::jsonb;

-- Enable RLS
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own sessions"
  ON auth_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own locations"
  ON auth_locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own verification attempts"
  ON auth_verification_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications"
  ON auth_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON auth_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX idx_auth_sessions_is_active ON auth_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_auth_locations_user_id ON auth_locations(user_id);
CREATE INDEX idx_auth_locations_ip_address ON auth_locations(ip_address);
CREATE INDEX idx_auth_verification_attempts_user_id ON auth_verification_attempts(user_id);
CREATE INDEX idx_auth_notifications_user_id ON auth_notifications(user_id);
CREATE INDEX idx_auth_notifications_read_at ON auth_notifications(read_at) WHERE read_at IS NULL;