-- Create course hierarchy tables
CREATE TABLE courses (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('complete', 'mini', 'masterclass')),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE modules (
  id text PRIMARY KEY,
  course_id text REFERENCES courses(id) NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  order_number integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, slug)
);

CREATE TABLE lessons (
  id text PRIMARY KEY,
  module_id text REFERENCES modules(id) NOT NULL,
  course_id text REFERENCES courses(id) NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  order_number integer NOT NULL,
  is_premium boolean DEFAULT true,
  path text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, slug),
  UNIQUE(course_id, module_id, slug)
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can view modules"
  ON modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can view lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_path ON lessons(path);

-- Insert initial course data
INSERT INTO courses (id, slug, type, title, description, price) VALUES
('full-course', 'web-developer-program', 'complete', 'The 90-Day Web Developer Program', 'Master web development with our structured, neurodivergent-friendly approach.', 2497),
('web-basics', 'web-basics', 'mini', 'Web Basics Bundle', 'Essential web development fundamentals', 247);

-- Insert module data
INSERT INTO modules (id, course_id, slug, title, description, order_number, price) VALUES
('full-course-module-1', 'full-course', 'programming-primer', 'Programming Primer', 'Master programming basics with ease and gain the confidence to progress.', 1, 197),
('full-course-module-2', 'full-course', 'typescript-navigator', 'TypeScript Navigator', 'Confidently set up TypeScript and unlock advanced skills.', 2, 247),
('web-basics-module-1', 'web-basics', 'html-fundamentals', 'HTML Fundamentals', 'Learn the building blocks of web pages', 1, 97);

-- Insert lesson data
INSERT INTO lessons (id, module_id, course_id, slug, title, description, order_number, is_premium, path) VALUES
('full-course-module-1-lesson-1', 'full-course-module-1', 'full-course', 'introduction', 'Introduction to Programming', 'Your first steps into programming', 1, false, '/lessons/full-course/programming-primer/introduction'),
('full-course-module-1-lesson-2', 'full-course-module-1', 'full-course', 'variables', 'Variables and Data Types', 'Understanding different types of data', 2, true, '/lessons/full-course/programming-primer/variables'),
('full-course-module-2-lesson-1', 'full-course-module-2', 'full-course', 'typescript-basics', 'TypeScript Basics', 'Getting started with TypeScript', 1, true, '/lessons/full-course/typescript-navigator/basics'),
('web-basics-module-1-lesson-1', 'web-basics-module-1', 'web-basics', 'html-intro', 'HTML Introduction', 'Getting started with HTML', 1, true, '/lessons/web-basics/html-fundamentals/intro');

-- Update user_progress to handle hierarchical paths
ALTER TABLE user_progress
ADD COLUMN course_id text REFERENCES courses(id),
ADD COLUMN module_id text REFERENCES modules(id);

-- Update user_achievements to handle hierarchical paths
ALTER TABLE user_achievements
ADD COLUMN course_id text REFERENCES courses(id),
ADD COLUMN module_id text REFERENCES modules(id);

-- Create function to get course structure
CREATE OR REPLACE FUNCTION get_course_structure(p_course_id text)
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
    WHERE c.id = p_course_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON courses TO authenticated;
GRANT SELECT ON modules TO authenticated;
GRANT SELECT ON lessons TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_structure TO authenticated;