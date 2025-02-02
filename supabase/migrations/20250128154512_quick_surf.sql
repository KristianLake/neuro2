-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_purchase_completion ON purchases;
DROP TRIGGER IF EXISTS purchase_status_transition ON purchases;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_purchase_completion();
DROP FUNCTION IF EXISTS check_purchase_status_transition();
DROP FUNCTION IF EXISTS update_purchase_status(uuid, uuid, text, text, integer);
DROP FUNCTION IF EXISTS update_purchase_status(uuid, uuid, purchase_status, purchase_status, integer);
DROP FUNCTION IF EXISTS update_purchase_status_v2(uuid, uuid, text, text, integer);

-- Add temporary column for status conversion
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS temp_status text;

-- Copy data to temporary column
UPDATE purchases 
SET temp_status = status::text;

-- Drop the status column (this will also drop the dependency on purchase_status type)
ALTER TABLE purchases 
DROP COLUMN status;

-- Rename temporary column to status
ALTER TABLE purchases 
RENAME COLUMN temp_status TO status;

-- Now we can safely drop the type
DROP TYPE IF EXISTS purchase_status;

-- Add proper constraint to the status column
ALTER TABLE purchases
ADD CONSTRAINT purchases_status_check 
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

-- Create function for atomic status updates
CREATE OR REPLACE FUNCTION update_purchase_status_v3(
  p_purchase_id uuid,
  p_user_id uuid,
  p_current_status text,
  p_new_status text,
  p_version integer
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
GRANT EXECUTE ON FUNCTION update_purchase_status_v3 TO authenticated;