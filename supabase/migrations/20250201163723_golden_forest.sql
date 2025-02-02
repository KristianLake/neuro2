-- Add slug redirects table
CREATE TABLE course_slug_redirects (
  old_slug text PRIMARY KEY,
  new_slug text NOT NULL REFERENCES courses(slug),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_slug_redirects ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Public can view slug redirects"
  ON course_slug_redirects
  FOR SELECT
  USING (true);

-- Grant anonymous access
GRANT SELECT ON course_slug_redirects TO anon;

-- Insert common redirects
INSERT INTO course_slug_redirects (old_slug, new_slug) VALUES
('web-basic', 'web-basics'),
('typescript', 'mini-typescript'),
('react', 'mini-react'),
('testing', 'mini-testing')
ON CONFLICT (old_slug) DO UPDATE
SET new_slug = EXCLUDED.new_slug;

-- Create index for faster lookups
CREATE INDEX idx_course_slug_redirects_old_slug 
ON course_slug_redirects(old_slug);