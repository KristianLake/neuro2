/*
  # Course Access Tables

  1. New Tables
    - `course_access`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `module_id` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `course_access` table
    - Add policy for authenticated users to read their own access
*/

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create course access table
CREATE TABLE IF NOT EXISTS course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  module_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

-- Create access policy
CREATE POLICY "Users can read own course access"
  ON course_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_course_access_user_module ON course_access(user_id, module_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_course_access_updated_at
  BEFORE UPDATE ON course_access
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();