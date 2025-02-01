/*
  # Add course access table

  1. New Tables
    - `course_access`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `module_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `course_access` table
    - Add policy for users to read their own access records
    - Add policy for admins to manage all access records
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own course access" ON course_access;
DROP POLICY IF EXISTS "Admins can manage course access" ON course_access;

-- Create or update course access table
CREATE TABLE IF NOT EXISTS course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  module_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, module_id)
);

-- Enable RLS
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own course access"
  ON course_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage course access"
  ON course_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_access_user_module 
ON course_access(user_id, module_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_course_access_updated_at ON course_access;

-- Create trigger
CREATE TRIGGER update_course_access_updated_at
  BEFORE UPDATE ON course_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON course_access TO authenticated;