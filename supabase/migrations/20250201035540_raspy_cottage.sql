-- Add type column to courses if not exists
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('complete', 'mini', 'masterclass'));

-- Update course types
UPDATE courses
SET type = CASE id
  WHEN 'full-course' THEN 'complete'
  WHEN 'web-basics' THEN 'mini'
  WHEN 'master-architecture' THEN 'masterclass'
  ELSE type
END
WHERE type IS NULL;

-- Add masterclass course if not exists
INSERT INTO courses (id, slug, type, title, description, price)
VALUES (
  'master-architecture',
  'architecture-masterclass',
  'masterclass',
  'Architecture & Performance Masterclass',
  'Deep dive into TypeScript design patterns, microservices architecture, and web performance optimization',
  447
)
ON CONFLICT (id) DO UPDATE
SET 
  slug = EXCLUDED.slug,
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = now();

-- Add masterclass modules
INSERT INTO modules (id, course_id, slug, title, description, order_number, price)
VALUES 
  ('master-arch-module-1', 'master-architecture', 'design-patterns', 'TypeScript Design Patterns', 'Deep dive into advanced TypeScript patterns', 1, 97),
  ('master-arch-module-2', 'master-architecture', 'microservices', 'Understanding Microservices', 'Building scalable microservices architecture', 2, 97),
  ('master-arch-module-3', 'master-architecture', 'performance', 'Web Performance Optimization', 'Advanced techniques for optimizing web applications', 3, 97)
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = now();

-- Add masterclass lessons
INSERT INTO lessons (id, module_id, course_id, slug, title, description, order_number, is_premium, path)
VALUES 
  ('master-arch-lesson-1', 'master-arch-module-1', 'master-architecture', 'intro-patterns', 'Introduction to Design Patterns', 'Understanding design patterns in TypeScript', 1, false, '/lessons/master-architecture/design-patterns/intro'),
  ('master-arch-lesson-2', 'master-arch-module-1', 'master-architecture', 'factory-pattern', 'Factory Pattern', 'Implementing the Factory pattern', 2, true, '/lessons/master-architecture/design-patterns/factory'),
  ('master-arch-lesson-3', 'master-arch-module-1', 'master-architecture', 'observer-pattern', 'Observer Pattern', 'Implementing the Observer pattern', 3, true, '/lessons/master-architecture/design-patterns/observer')
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_premium = EXCLUDED.is_premium,
  path = EXCLUDED.path,
  updated_at = now();

-- Create function to get course by slug
CREATE OR REPLACE FUNCTION get_course_by_slug(p_slug text)
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'id', c.id,
      'slug', c.slug,
      'type', c.type,
      'title', c.title,
      'description', c.description,
      'price', c.price,
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
    WHERE c.slug = p_slug
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_course_by_slug TO authenticated;