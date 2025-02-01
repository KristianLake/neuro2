-- Add status_reason column to purchases table
ALTER TABLE purchases
ADD COLUMN status_reason text;

-- Create function to update purchase status with reason
CREATE OR REPLACE FUNCTION update_purchase_status_v4(
  p_purchase_id uuid,
  p_user_id uuid,
  p_current_status text,
  p_new_status text,
  p_version integer,
  p_status_reason text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_updated boolean;
  v_current_status text;
  v_current_version integer;
BEGIN
  -- Validate status values
  IF p_current_status NOT IN ('pending', 'completed', 'failed', 'refunded') OR
     p_new_status NOT IN ('pending', 'completed', 'failed', 'refunded') THEN
    RAISE EXCEPTION 'Invalid status value provided';
  END IF;

  -- First, get current status and version
  SELECT status, version
  INTO v_current_status, v_current_version
  FROM purchases
  WHERE id = p_purchase_id AND user_id = p_user_id;

  -- If no purchase found, return false
  IF v_current_status IS NULL THEN
    RETURN false;
  END IF;

  -- If status is already as expected, return true
  IF v_current_status = p_new_status THEN
    RETURN true;
  END IF;

  -- If version doesn't match, return false (optimistic locking failure)
  IF v_current_version != p_version THEN
    RETURN false;
  END IF;

  -- Validate status transition
  IF v_current_status = 'pending' AND p_new_status NOT IN ('completed', 'failed') THEN
    RAISE EXCEPTION 'Invalid status transition from pending to %', p_new_status;
  END IF;

  IF v_current_status = 'completed' AND p_new_status != 'refunded' THEN
    RAISE EXCEPTION 'Completed purchase can only transition to refunded';
  END IF;

  IF v_current_status IN ('failed', 'refunded') THEN
    RAISE EXCEPTION 'Cannot change status of failed or refunded purchase';
  END IF;

  -- Attempt the update with optimistic locking
  WITH updated AS (
    UPDATE purchases
    SET 
      status = p_new_status,
      status_reason = p_status_reason,
      version = version + 1,
      updated_at = now()
    WHERE id = p_purchase_id
      AND user_id = p_user_id
      AND status = p_current_status
      AND version = p_version
    RETURNING id
  )
  SELECT EXISTS (SELECT 1 FROM updated) INTO v_updated;

  -- If update was successful and status is completed, handle course access
  IF v_updated AND p_new_status = 'completed' THEN
    -- Get product type
    DECLARE
      product_type text;
    BEGIN
      SELECT type INTO product_type
      FROM products
      WHERE id = (
        SELECT product_id 
        FROM purchases 
        WHERE id = p_purchase_id
      );

      -- If it's a module purchase, grant access
      IF product_type = 'module' THEN
        INSERT INTO course_access (user_id, module_id)
        VALUES (p_user_id, (
          SELECT product_id 
          FROM purchases 
          WHERE id = p_purchase_id
        ))
        ON CONFLICT (user_id, module_id) DO NOTHING;
      -- If it's a course purchase, grant access to all modules
      ELSIF product_type = 'course' THEN
        -- Insert access for all modules
        INSERT INTO course_access (user_id, module_id)
        SELECT 
          p_user_id,
          'module-' || generate_series(1, 9)
        ON CONFLICT (user_id, module_id) DO NOTHING;
      END IF;
    END;
  END IF;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_purchase_status_v4 TO authenticated;