-- Ensure course exists with correct slug
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

-- Ensure modules exist
INSERT INTO modules (id, course_id, slug, title, description, order_number, price)
VALUES 
  ('full-course-module-1', 'full-course', 'programming-primer', 'Programming Primer', 'Master programming basics with ease and gain the confidence to progress.', 1, 197),
  ('full-course-module-2', 'full-course', 'typescript-navigator', 'TypeScript Navigator', 'Confidently set up TypeScript and unlock advanced skills.', 2, 247)
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price;

-- Ensure lessons exist
INSERT INTO lessons (id, module_id, course_id, slug, title, description, order_number, is_premium, path)
VALUES 
  ('full-course-module-1-lesson-1', 'full-course-module-1', 'full-course', 'introduction', 'Introduction to Programming', 'Your first steps into programming', 1, false, '/lessons/full-course/programming-primer/introduction'),
  ('full-course-module-1-lesson-2', 'full-course-module-1', 'full-course', 'variables', 'Variables and Data Types', 'Understanding different types of data', 2, true, '/lessons/full-course/programming-primer/variables')
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_premium = EXCLUDED.is_premium,
  path = EXCLUDED.path;

-- Create or update function to get course by slug with better error handling
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
    'metadata', jsonb_build_object(
      'targetAudience', ARRAY[]::text[],
      'idealFor', ARRAY[]::text[],
      'notFor', ARRAY[]::text[],
      'benefits', jsonb_build_object(
        'increase', ARRAY[]::text[],
        'decrease', ARRAY[]::text[]
      )
    ),
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
                'isPremium', l.is_premium,
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

-- Add slug redirects
INSERT INTO course_slug_redirects (old_slug, new_slug)
VALUES 
  ('full-course', 'web-developer-program'),
  ('90-day-program', 'web-developer-program')
ON CONFLICT (old_slug) DO UPDATE
SET new_slug = EXCLUDED.new_slug;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);