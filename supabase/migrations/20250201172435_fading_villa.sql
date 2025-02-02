-- Update course data with correct slugs and IDs
UPDATE courses
SET slug = 'web-developer-program'
WHERE id = 'full-course';

-- Ensure course exists
INSERT INTO courses (id, slug, type, title, description, price)
VALUES (
  'full-course',
  'web-developer-program',
  'complete',
  'The 90-Day Web Developer Program',
  'Master web development with our structured, neurodivergent-friendly approach.',
  2497
)
ON CONFLICT (id) DO UPDATE
SET 
  slug = EXCLUDED.slug,
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price;

-- Create function to get course by slug with better error handling
CREATE OR REPLACE FUNCTION get_course_by_slug(p_slug text)
RETURNS jsonb AS $$
DECLARE
  v_new_slug text;
  v_course_data jsonb;
BEGIN
  -- Check for redirect
  SELECT new_slug INTO v_new_slug
  FROM course_slug_redirects
  WHERE old_slug = p_slug;

  -- Get course data
  SELECT jsonb_build_object(
    'id', c.id,
    'slug', c.slug,
    'type', c.type,
    'title', c.title,
    'description', c.description,
    'price', c.price,
    'course_path', c.course_path,
    'modules', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'slug', m.slug,
          'title', m.title,
          'description', m.description,
          'order_number', m.order_number,
          'price', m.price,
          'lessons', COALESCE((
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
          ), '[]'::jsonb)
        ) ORDER BY m.order_number
      )
      FROM modules m
      WHERE m.course_id = c.id
    ), '[]'::jsonb)
  ) INTO v_course_data
  FROM courses c
  WHERE c.slug = COALESCE(v_new_slug, p_slug);

  IF v_course_data IS NULL THEN
    RAISE EXCEPTION 'Course not found: %', p_slug;
  END IF;

  RETURN v_course_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;