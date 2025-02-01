-- Create function to handle course access mapping
CREATE OR REPLACE FUNCTION handle_purchase_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get product type and ID
    DECLARE
      product_type text;
      product_id text;
    BEGIN
      SELECT type INTO product_type
      FROM products
      WHERE id = NEW.product_id;

      -- If it's a module purchase, grant access
      IF product_type = 'module' THEN
        INSERT INTO course_access (user_id, module_id)
        VALUES (NEW.user_id, NEW.product_id)
        ON CONFLICT (user_id, module_id) DO NOTHING;
        
        -- Also insert a record for the module ID
        INSERT INTO course_access (user_id, module_id)
        VALUES (NEW.user_id, NEW.product_id)
        ON CONFLICT (user_id, module_id) DO NOTHING;
      
      -- If it's a course purchase, grant access to all modules and the course itself
      ELSIF product_type = 'course' THEN
        -- Insert access for all modules
        INSERT INTO course_access (user_id, module_id)
        SELECT 
          NEW.user_id,
          'module-' || generate_series(1, 9)
        ON CONFLICT (user_id, module_id) DO NOTHING;
        
        -- Also insert a record for the course ID (preserving premium vs standard)
        INSERT INTO course_access (user_id, module_id)
        VALUES (NEW.user_id, NEW.product_id)
        ON CONFLICT (user_id, module_id) DO NOTHING;
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_purchase_completion ON purchases;

-- Create trigger for purchase completion
CREATE TRIGGER on_purchase_completion
  AFTER UPDATE ON purchases
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION handle_purchase_completion();

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
    AND (
      -- Direct module access
      ca.module_id = p_module_id
      OR 
      -- Full course access (standard or premium) grants access to all modules
      (ca.module_id LIKE 'full-course%' AND p_module_id LIKE 'module-%')
    )
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
    AND EXISTS (
      SELECT 1
      FROM purchases p
      WHERE p.user_id = ca.user_id
      AND p.status = 'completed'
      AND p.product_id = ca.module_id
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
  -- Find completed full course purchases without proper access records
  FOR r IN 
    SELECT DISTINCT p.user_id, p.product_id
    FROM purchases p
    WHERE p.status = 'completed'
    AND p.product_id LIKE 'full-course%'
  LOOP
    -- Grant access to all modules and the course itself (preserving premium vs standard)
    INSERT INTO course_access (user_id, module_id)
    SELECT 
      r.user_id,
      module_id
    FROM (
      SELECT 'module-' || generate_series(1, 9) as module_id
      UNION ALL
      SELECT r.product_id -- This preserves full-course vs full-course-premium
    ) modules
    ON CONFLICT (user_id, module_id) DO NOTHING;
  END LOOP;
END $$;