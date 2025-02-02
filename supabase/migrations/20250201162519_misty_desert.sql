-- Drop existing policy
DROP POLICY IF EXISTS "Everyone can view courses" ON courses;

-- Create new policy for public access
CREATE POLICY "Public can view courses"
  ON courses
  FOR SELECT
  USING (true);

-- Grant anonymous access
GRANT SELECT ON courses TO anon;