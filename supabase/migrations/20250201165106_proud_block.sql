-- Update course data with proper slugs and paths
UPDATE courses
SET 
  slug = CASE id
    WHEN 'full-course' THEN 'web-developer-program'
    WHEN 'web-basics' THEN 'web-basics'
    WHEN 'master-architecture' THEN 'architecture-masterclass'
    WHEN 'mini-typescript' THEN 'typescript-essentials'
    WHEN 'mini-react' THEN 'react-fundamentals'
    WHEN 'mini-testing' THEN 'testing-essentials'
    ELSE slug
  END,
  course_path = CASE id
    WHEN 'mini-typescript' THEN '/courses/mini-typescript'
    WHEN 'mini-react' THEN '/courses/mini-react'
    WHEN 'mini-testing' THEN '/courses/mini-testing'
    ELSE course_path
  END
WHERE id IN ('full-course', 'web-basics', 'master-architecture', 'mini-typescript', 'mini-react', 'mini-testing');

-- Insert or update slug redirects
INSERT INTO course_slug_redirects (old_slug, new_slug) VALUES
('full-course', 'web-developer-program'),
('web-basic', 'web-basics'),
('typescript', 'typescript-essentials'),
('react', 'react-fundamentals'),
('testing', 'testing-essentials'),
('master-arch', 'architecture-masterclass')
ON CONFLICT (old_slug) DO UPDATE
SET new_slug = EXCLUDED.new_slug;

-- Update module slugs
UPDATE modules
SET slug = CASE id
  WHEN 'full-course-module-1' THEN 'programming-primer'
  WHEN 'full-course-module-2' THEN 'typescript-navigator'
  WHEN 'web-basics-module-1' THEN 'html-fundamentals'
  WHEN 'master-arch-module-1' THEN 'design-patterns'
  WHEN 'master-arch-module-2' THEN 'microservices'
  WHEN 'master-arch-module-3' THEN 'performance'
  WHEN 'mini-ts-module-1' THEN 'ts-basics'
  WHEN 'mini-ts-module-2' THEN 'ts-advanced'
  WHEN 'mini-react-module-1' THEN 'react-basics'
  WHEN 'mini-react-module-2' THEN 'react-hooks'
  ELSE slug
END
WHERE id IN (
  'full-course-module-1',
  'full-course-module-2',
  'web-basics-module-1',
  'master-arch-module-1',
  'master-arch-module-2',
  'master-arch-module-3',
  'mini-ts-module-1',
  'mini-ts-module-2',
  'mini-react-module-1',
  'mini-react-module-2'
);

-- Update lesson paths
UPDATE lessons
SET path = CASE id
  WHEN 'full-course-module-1-lesson-1' THEN '/lessons/full-course/programming-primer/introduction'
  WHEN 'full-course-module-1-lesson-2' THEN '/lessons/full-course/programming-primer/variables'
  WHEN 'full-course-module-2-lesson-1' THEN '/lessons/full-course/typescript-navigator/basics'
  WHEN 'web-basics-module-1-lesson-1' THEN '/lessons/web-basics/html-fundamentals/intro'
  WHEN 'master-arch-lesson-1' THEN '/lessons/master-architecture/design-patterns/intro'
  WHEN 'master-arch-lesson-2' THEN '/lessons/master-architecture/design-patterns/factory'
  WHEN 'master-arch-lesson-3' THEN '/lessons/master-architecture/design-patterns/observer'
  WHEN 'mini-ts-lesson-1' THEN '/lessons/mini-typescript/basics/intro'
  WHEN 'mini-ts-lesson-2' THEN '/lessons/mini-typescript/basics/types'
  WHEN 'mini-react-lesson-1' THEN '/lessons/mini-react/fundamentals/intro'
  WHEN 'mini-react-lesson-2' THEN '/lessons/mini-react/fundamentals/components'
  ELSE path
END
WHERE id IN (
  'full-course-module-1-lesson-1',
  'full-course-module-1-lesson-2',
  'full-course-module-2-lesson-1',
  'web-basics-module-1-lesson-1',
  'master-arch-lesson-1',
  'master-arch-lesson-2',
  'master-arch-lesson-3',
  'mini-ts-lesson-1',
  'mini-ts-lesson-2',
  'mini-react-lesson-1',
  'mini-react-lesson-2'
);

-- Verify indexes exist
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_path ON courses(course_path) WHERE course_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_modules_slug ON modules(slug);
CREATE INDEX IF NOT EXISTS idx_lessons_path ON lessons(path);