-- Function to check course access with improved logic
CREATE OR REPLACE FUNCTION check_course_access(
  p_user_id uuid,
  p_module_id text
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM course_access ca
    WHERE ca.user_id = p_user_id
    AND ca.module_id = p_module_id
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
    AND EXISTS (
      SELECT 1
      FROM purchases p
      WHERE p.user_id = ca.user_id
      AND p.status = 'completed'
      AND (
        -- Direct module purchase
        p.product_id = ca.module_id
        OR 
        -- Full course purchase (any module)
        (p.product_id LIKE 'full-course%' AND ca.module_id LIKE 'module-%')
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_course_access TO authenticated;

-- Fix any incorrect access states
DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Find completed full course purchases without module access
  FOR r IN 
    SELECT DISTINCT p.user_id, p.product_id
    FROM purchases p
    WHERE p.status = 'completed'
    AND p.product_id LIKE 'full-course%'
    AND NOT EXISTS (
      SELECT 1 
      FROM course_access ca 
      WHERE ca.user_id = p.user_id
      AND ca.module_id LIKE 'module-%'
    )
  LOOP
    -- Grant access to all modules
    INSERT INTO course_access (user_id, module_id)
    SELECT 
      r.user_id,
      'module-' || generate_series(1, 9)
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END LOOP;
END $$;