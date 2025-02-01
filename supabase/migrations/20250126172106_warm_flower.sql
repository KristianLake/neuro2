/*
  # Add admin user to users table

  1. Changes
    - Insert admin user into users table
    - Set role to 'admin'
    - Copy metadata from auth.users
*/

-- Insert admin user if not exists
INSERT INTO users (id, email, role, created_at, user_metadata)
SELECT 
  id,
  email,
  'admin',
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'kristian.test@dominatingstudios.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  updated_at = now();