-- Add mini course path column to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS course_path text UNIQUE;

-- Update existing mini courses with their paths
UPDATE courses
SET course_path = CASE id
  WHEN 'mini-typescript' THEN '/lessons/mini-typescript'
  WHEN 'mini-react' THEN '/lessons/mini-react'
  WHEN 'mini-testing' THEN '/lessons/mini-testing'
  ELSE course_path
END
WHERE type = 'mini';

-- Create index for path lookups
CREATE INDEX IF NOT EXISTS idx_courses_path ON courses(course_path)
WHERE type = 'mini';