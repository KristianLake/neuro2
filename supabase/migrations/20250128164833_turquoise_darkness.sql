-- Add max_purchases column to products table
ALTER TABLE products
ADD COLUMN max_purchases integer DEFAULT NULL;

-- Update max_purchases for full course products
UPDATE products 
SET max_purchases = 1 
WHERE id IN ('full-course', 'full-course-premium');

-- Create function to check if purchase is allowed
CREATE OR REPLACE FUNCTION can_purchase_product(
  p_user_id uuid,
  p_product_id text
)
RETURNS jsonb AS $$
DECLARE
  v_product_type text;
  v_product_price numeric;
  v_completed_purchases integer;
  v_owned_modules jsonb;
  v_discount numeric := 0;
  v_result jsonb;
BEGIN
  -- Get product info
  SELECT type, price
  INTO v_product_type, v_product_price
  FROM products
  WHERE id = p_product_id;

  -- Count completed purchases for this product
  SELECT COUNT(*)
  INTO v_completed_purchases
  FROM purchases
  WHERE user_id = p_user_id
  AND product_id = p_product_id
  AND status = 'completed';

  -- Initialize result
  v_result := jsonb_build_object(
    'allowed', false,
    'reason', null,
    'original_price', v_product_price,
    'final_price', v_product_price,
    'discount', 0,
    'owned_modules', '[]'::jsonb
  );

  -- Check max purchases limit
  IF EXISTS (
    SELECT 1 FROM products 
    WHERE id = p_product_id 
    AND max_purchases IS NOT NULL 
    AND v_completed_purchases >= max_purchases
  ) THEN
    -- Special case: Allow upgrade from standard to premium
    IF p_product_id = 'full-course-premium' THEN
      IF EXISTS (
        SELECT 1 FROM purchases
        WHERE user_id = p_user_id
        AND product_id = 'full-course'
        AND status = 'completed'
      ) THEN
        -- Calculate upgrade price (difference between premium and standard)
        SELECT (premium.price - standard.price)
        INTO v_product_price
        FROM products premium, products standard
        WHERE premium.id = 'full-course-premium'
        AND standard.id = 'full-course';

        RETURN jsonb_build_object(
          'allowed', true,
          'reason', 'upgrade',
          'original_price', v_product_price,
          'final_price', v_product_price,
          'discount', 0,
          'owned_modules', '[]'::jsonb
        );
      ELSE
        RETURN v_result || jsonb_build_object(
          'reason', 'max_purchases_reached'
        );
      END IF;
    ELSE
      RETURN v_result || jsonb_build_object(
        'reason', 'max_purchases_reached'
      );
    END IF;
  END IF;

  -- For full course purchases, check owned modules and calculate discount
  IF v_product_type = 'course' THEN
    WITH owned_modules AS (
      SELECT DISTINCT p.product_id, pr.price
      FROM purchases p
      JOIN products pr ON pr.id = p.product_id
      WHERE p.user_id = p_user_id
      AND p.status = 'completed'
      AND p.product_id LIKE 'module-%'
    )
    SELECT 
      jsonb_agg(product_id),
      COALESCE(SUM(price) * 0.5, 0) -- 50% credit for owned modules
    INTO v_owned_modules, v_discount
    FROM owned_modules;

    -- Calculate final price
    v_product_price := GREATEST(v_product_price - v_discount, 0);

    RETURN jsonb_build_object(
      'allowed', true,
      'reason', 'module_discount',
      'original_price', v_result->>'original_price',
      'final_price', v_product_price,
      'discount', v_discount,
      'owned_modules', COALESCE(v_owned_modules, '[]'::jsonb)
    );
  END IF;

  -- For module purchases, check if already owned through full course
  IF v_product_type = 'module' THEN
    IF EXISTS (
      SELECT 1 FROM purchases p
      WHERE p.user_id = p_user_id
      AND p.status = 'completed'
      AND p.product_id LIKE 'full-course%'
    ) THEN
      RETURN v_result || jsonb_build_object(
        'reason', 'already_owned_through_course'
      );
    END IF;

    -- Check if module already owned directly
    IF EXISTS (
      SELECT 1 FROM purchases p
      WHERE p.user_id = p_user_id
      AND p.status = 'completed'
      AND p.product_id = p_product_id
    ) THEN
      RETURN v_result || jsonb_build_object(
        'reason', 'already_owned'
      );
    END IF;
  END IF;

  -- If we get here, purchase is allowed
  RETURN jsonb_build_object(
    'allowed', true,
    'reason', null,
    'original_price', v_result->>'original_price',
    'final_price', v_product_price,
    'discount', v_discount,
    'owned_modules', COALESCE(v_owned_modules, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_purchase_product TO authenticated;