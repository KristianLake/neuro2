-- Add expires_at column if it doesn't exist
ALTER TABLE course_access 
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Create function to handle course access revocation
CREATE OR REPLACE FUNCTION handle_purchase_refund()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to refunded
  IF NEW.status = 'refunded' AND OLD.status != 'refunded' THEN
    -- Get product type
    DECLARE
      product_type text;
    BEGIN
      SELECT type INTO product_type
      FROM products
      WHERE id = NEW.product_id;

      -- If it's a module purchase, revoke access
      IF product_type = 'module' THEN
        DELETE FROM course_access
        WHERE user_id = NEW.user_id
        AND module_id = NEW.product_id;
      -- If it's a course purchase, revoke access to all modules
      ELSIF product_type = 'course' THEN
        DELETE FROM course_access
        WHERE user_id = NEW.user_id
        AND module_id LIKE 'module-%';
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for purchase refunds
DROP TRIGGER IF EXISTS on_purchase_refund ON purchases;
CREATE TRIGGER on_purchase_refund
  AFTER UPDATE ON purchases
  FOR EACH ROW
  WHEN (NEW.status = 'refunded' AND OLD.status != 'refunded')
  EXECUTE FUNCTION handle_purchase_refund();

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
    JOIN purchases p ON 
      p.user_id = ca.user_id AND
      (
        -- Direct module purchase
        (p.product_id = ca.module_id) OR
        -- Full course purchase (any module)
        (p.product_id LIKE 'full-course%' AND ca.module_id LIKE 'module-%')
      )
    WHERE ca.user_id = p_user_id
    AND ca.module_id = p_module_id
    AND p.status = 'completed'
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
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
  -- Find completed purchases without corresponding access
  FOR r IN 
    SELECT DISTINCT p.user_id, p.product_id, p.id as purchase_id
    FROM purchases p
    LEFT JOIN course_access ca ON 
      (p.product_id = ca.module_id OR p.product_id LIKE 'full-course%')
      AND p.user_id = ca.user_id
    WHERE p.status = 'completed'
    AND ca.id IS NULL
  LOOP
    -- Get product type
    DECLARE
      product_type text;
    BEGIN
      SELECT type INTO product_type
      FROM products
      WHERE id = r.product_id;

      -- Grant appropriate access
      IF product_type = 'module' THEN
        INSERT INTO course_access (user_id, module_id)
        VALUES (r.user_id, r.product_id)
        ON CONFLICT (user_id, module_id) DO NOTHING;
      ELSIF product_type = 'course' THEN
        INSERT INTO course_access (user_id, module_id)
        SELECT 
          r.user_id,
          'module-' || generate_series(1, 9)
        ON CONFLICT (user_id, module_id) DO NOTHING;
      END IF;
    END;
  END LOOP;

  -- Remove access for refunded purchases
  FOR r IN 
    SELECT DISTINCT p.user_id, p.product_id
    FROM purchases p
    JOIN course_access ca ON 
      (p.product_id = ca.module_id OR p.product_id LIKE 'full-course%')
      AND p.user_id = ca.user_id
    WHERE p.status = 'refunded'
  LOOP
    -- Get product type
    DECLARE
      product_type text;
    BEGIN
      SELECT type INTO product_type
      FROM products
      WHERE id = r.product_id;

      -- Revoke appropriate access
      IF product_type = 'module' THEN
        DELETE FROM course_access
        WHERE user_id = r.user_id
        AND module_id = r.product_id;
      ELSIF product_type = 'course' THEN
        DELETE FROM course_access
        WHERE user_id = r.user_id
        AND module_id LIKE 'module-%';
      END IF;
    END;
  END LOOP;

  -- Restore access for completed purchases that were incorrectly removed
  INSERT INTO course_access (user_id, module_id)
  SELECT DISTINCT p.user_id, 
    CASE 
      WHEN p.product_id LIKE 'full-course%' THEN 'module-' || m.module_num
      ELSE p.product_id
    END
  FROM purchases p
  CROSS JOIN (SELECT generate_series(1, 9) as module_num) m
  WHERE p.status = 'completed'
  AND (
    p.product_id LIKE 'module-%' OR 
    p.product_id LIKE 'full-course%'
  )
  AND NOT EXISTS (
    SELECT 1 
    FROM course_access ca 
    WHERE ca.user_id = p.user_id
    AND ca.module_id = CASE 
      WHEN p.product_id LIKE 'full-course%' THEN 'module-' || m.module_num
      ELSE p.product_id
    END
  )
  ON CONFLICT (user_id, module_id) DO NOTHING;
END $$;