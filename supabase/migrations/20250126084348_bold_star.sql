/*
  # Course Access Policy Update

  1. Functions
    - Ensure update_updated_at_column() exists
  
  2. Tables
    - Ensure course_access table exists with proper structure
  
  3. Security
    - Add policy for authenticated users to read their own access (if not exists)
*/

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Create course access table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  module_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

-- Create access policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'course_access' 
    AND policyname = 'Users can read own course access'
  ) THEN
    CREATE POLICY "Users can read own course access"
      ON course_access
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_course_access_user_module ON course_access(user_id, module_id);

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_course_access_updated_at'
  ) THEN
    CREATE TRIGGER update_course_access_updated_at
      BEFORE UPDATE ON course_access
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;