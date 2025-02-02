-- Create course slug redirects table
CREATE TABLE course_slug_redirects (
  old_slug text PRIMARY KEY,
  new_slug text NOT NULL,
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

-- Create function to handle slug redirects
CREATE OR REPLACE FUNCTION get_course_by_slug(p_slug text)
RETURNS jsonb AS $$
DECLARE
  v_new_slug text;
BEGIN
  -- Check for redirect
  SELECT new_slug INTO v_new_slug
  FROM course_slug_redirects
  WHERE old_slug = p_slug;

  -- Use new slug if found, otherwise use original
  RETURN (
    SELECT jsonb_build_object(
      'id', c.id,
      'slug', c.slug,
      'type', c.type,
      'title', c.title,
      'description', c.description,
      'price', c.price,
      'course_path', c.course_path,
      'modules', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', m.id,
            'slug', m.slug,
            'title', m.title,
            'description', m.description,
            'order_number', m.order_number,
            'price', m.price,
            'lessons', (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', l.id,
                  'slug', l.slug,
                  'title', l.title,
                  'description', l.description,
                  'order_number', l.order_number,
                  'is_premium', l.is_premium,
                  'path', l.path
                ) ORDER BY l.order_number
              )
              FROM lessons l
              WHERE l.module_id = m.id
            )
          ) ORDER BY m.order_number
        )
        FROM modules m
        WHERE m.course_id = c.id
      )
    )
    FROM courses c
    WHERE c.slug = COALESCE(v_new_slug, p_slug)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_course_by_slug TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_by_slug TO anon;