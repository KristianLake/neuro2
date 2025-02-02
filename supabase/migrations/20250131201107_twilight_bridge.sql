-- Insert mock course data for testing
-- Note: This is mock data for testing and can be easily removed

-- Insert mock courses
INSERT INTO courses (id, slug, type, title, description, price) VALUES
-- Master Course from Roadmap
('master-architecture', 'architecture-masterclass', 'masterclass', 'Architecture & Performance Masterclass', 'Deep dive into TypeScript design patterns, microservices, and web performance optimization', 447),

-- Mini Courses (max 3 modules each)
('mini-typescript', 'typescript-essentials', 'mini', 'TypeScript Essentials', 'Quick start guide to TypeScript fundamentals', 197),
('mini-react', 'react-fundamentals', 'mini', 'React Fundamentals', 'Build modern UIs with React', 297),
('mini-testing', 'testing-essentials', 'mini', 'Testing Essentials', 'Master unit testing and test-driven development', 247)
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = now();

-- Insert mock modules
INSERT INTO modules (id, course_id, slug, title, description, order_number, price) VALUES
-- Master Course Modules
('master-arch-module-1', 'master-architecture', 'design-patterns', 'TypeScript Design Patterns', 'Deep dive into advanced TypeScript patterns', 1, 97),
('master-arch-module-2', 'master-architecture', 'microservices', 'Understanding Microservices', 'Building scalable microservices architecture', 2, 97),
('master-arch-module-3', 'master-architecture', 'performance', 'Web Performance Optimization', 'Advanced techniques for optimizing web applications', 3, 97),

-- TypeScript Mini Course Modules
('mini-ts-module-1', 'mini-typescript', 'ts-basics', 'TypeScript Basics', 'Getting started with TypeScript', 1, 97),
('mini-ts-module-2', 'mini-typescript', 'ts-advanced', 'Advanced TypeScript', 'Advanced types and patterns', 2, 97),

-- React Mini Course Modules
('mini-react-module-1', 'mini-react', 'react-basics', 'React Fundamentals', 'Core React concepts', 1, 97),
('mini-react-module-2', 'mini-react', 'react-hooks', 'React Hooks', 'Modern React with Hooks', 2, 97),
('mini-react-module-3', 'mini-react', 'react-patterns', 'React Patterns', 'Common React patterns and best practices', 3, 97),

-- Testing Mini Course Modules
('mini-testing-module-1', 'mini-testing', 'testing-basics', 'Testing Fundamentals', 'Introduction to testing', 1, 97),
('mini-testing-module-2', 'mini-testing', 'unit-testing', 'Unit Testing', 'Writing effective unit tests', 2, 97)
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = now();

-- Insert mock lessons
INSERT INTO lessons (id, module_id, course_id, slug, title, description, order_number, is_premium, path) VALUES
-- Master Course Lessons
('master-arch-lesson-1', 'master-arch-module-1', 'master-architecture', 'intro-patterns', 'Introduction to Design Patterns', 'Understanding design patterns in TypeScript', 1, false, '/lessons/master-architecture/design-patterns/intro'),
('master-arch-lesson-2', 'master-arch-module-1', 'master-architecture', 'factory-pattern', 'Factory Pattern', 'Implementing the Factory pattern', 2, true, '/lessons/master-architecture/design-patterns/factory'),

-- TypeScript Mini Course Lessons
('mini-ts-lesson-1', 'mini-ts-module-1', 'mini-typescript', 'ts-intro', 'TypeScript Introduction', 'Getting started with TypeScript', 1, false, '/lessons/mini-typescript/basics/intro'),
('mini-ts-lesson-2', 'mini-ts-module-1', 'mini-typescript', 'ts-types', 'Basic Types', 'Understanding TypeScript types', 2, true, '/lessons/mini-typescript/basics/types'),

-- React Mini Course Lessons
('mini-react-lesson-1', 'mini-react-module-1', 'mini-react', 'react-intro', 'Introduction to React', 'Getting started with React', 1, false, '/lessons/mini-react/fundamentals/intro'),
('mini-react-lesson-2', 'mini-react-module-1', 'mini-react', 'components', 'Components', 'Building React components', 2, true, '/lessons/mini-react/fundamentals/components'),

-- Testing Mini Course Lessons
('mini-testing-lesson-1', 'mini-testing-module-1', 'mini-testing', 'testing-intro', 'Introduction to Testing', 'Why testing matters', 1, false, '/lessons/mini-testing/fundamentals/intro'),
('mini-testing-lesson-2', 'mini-testing-module-1', 'mini-testing', 'first-test', 'Your First Test', 'Writing your first test', 2, true, '/lessons/mini-testing/fundamentals/first-test')
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_premium = EXCLUDED.is_premium,
  updated_at = now();

-- Add comment explaining this is mock data
COMMENT ON TABLE courses IS 'Course catalog - includes mock data for testing';
COMMENT ON TABLE modules IS 'Course modules - includes mock data for testing';
COMMENT ON TABLE lessons IS 'Course lessons - includes mock data for testing';

-- Create index for better querying
CREATE INDEX IF NOT EXISTS idx_lessons_premium ON lessons(is_premium) WHERE NOT is_premium;