-- Drop existing policies
DROP POLICY IF EXISTS "Public can view courses" ON courses;
DROP POLICY IF EXISTS "Public can view modules" ON modules;
DROP POLICY IF EXISTS "Public can view lessons" ON lessons;

-- Create new policies for public access
CREATE POLICY "Public can view courses"
  ON courses
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view modules"
  ON modules
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view lessons"
  ON lessons
  FOR SELECT
  USING (true);

-- Grant anonymous access
GRANT SELECT ON courses TO anon;
GRANT SELECT ON modules TO anon;
GRANT SELECT ON lessons TO anon;