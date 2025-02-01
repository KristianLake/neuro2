/*
  # Set admin user and add admin features

  1. Changes
    - Set kristian.test@dominatingstudios.com as admin
    - Add admin management capabilities
    - Add user management table
*/

-- Update user role to admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'kristian.test@dominatingstudios.com';