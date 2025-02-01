-- Add course_id and module_id columns if they don't exist
DO $$ 
BEGIN
  -- Add course_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'course_access' 
    AND column_name = 'course_id'
  ) THEN
    ALTER TABLE course_access
    ADD COLUMN course_id text REFERENCES courses(id);
  END IF;

  -- Add module_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'course_access' 
    AND column_name = 'module_id'
  ) THEN
    ALTER TABLE course_access
    ADD COLUMN module_id text REFERENCES modules(id);
  END IF;
END $$;

-- Update existing course access records
UPDATE course_access ca
SET 
  course_id = CASE 
    WHEN ca.module_id LIKE 'full-course%' THEN 'full-course'
    WHEN ca.module_id LIKE 'web-basics%' THEN 'web-basics'
    ELSE NULL
  END,
  module_id = CASE 
    WHEN ca.module_id LIKE 'module-%' THEN 
      (SELECT id FROM modules WHERE course_id = 'full-course' AND order_number = CAST(substring(ca.module_id from 'module-(\d+)') AS integer))
    ELSE NULL
  END
WHERE course_id IS NULL OR module_id IS NULL;

-- Create function to check course access with hierarchy
CREATE OR REPLACE FUNCTION check_course_access_v2(
  p_user_id uuid,
  p_course_id text,
  p_module_id text DEFAULT NULL,
  p_lesson_id text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  -- Check direct course access
  IF EXISTS (
    SELECT 1 
    FROM course_access ca
    WHERE ca.user_id = p_user_id
    AND ca.course_id = p_course_id
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
  ) THEN
    RETURN true;
  END IF;

  -- Check module access
  IF p_module_id IS NOT NULL AND EXISTS (
    SELECT 1 
    FROM course_access ca
    WHERE ca.user_id = p_user_id
    AND ca.module_id = p_module_id
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
  ) THEN
    RETURN true;
  END IF;

  -- Check lesson access (free lessons)
  IF p_lesson_id IS NOT NULL AND EXISTS (
    SELECT 1 
    FROM lessons l
    WHERE l.id = p_lesson_id
    AND NOT l.is_premium
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_course_access_v2 TO authenticated;