-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_purchase_completion ON purchases;
DROP TRIGGER IF EXISTS purchase_status_transition ON purchases;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_purchase_completion();
DROP FUNCTION IF EXISTS check_purchase_status_transition();
DROP FUNCTION IF EXISTS update_purchase_status(uuid, uuid, text, text, integer);
DROP FUNCTION IF EXISTS update_purchase_status(uuid, uuid, purchase_status, purchase_status, integer);

-- Create function for atomic status updates with explicit parameter names
CREATE OR REPLACE FUNCTION update_purchase_status_v2(
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
  v_is_valid_status boolean;
BEGIN
  -- Validate status values
  IF p_current_status NOT IN ('pending', 'completed', 'failed', 'refunded') OR
     p_new_status NOT IN ('pending', 'completed', 'failed', 'refunded') THEN
    RAISE EXCEPTION 'Invalid status value provided';
  END IF;

  -- First, get current status and version
  SELECT 
    status, 
    version,
    status = ANY(ARRAY['pending', 'completed', 'failed', 'refunded'])
  INTO v_current_status, v_current_version, v_is_valid_status
  FROM purchases
  WHERE id = p_purchase_id AND user_id = p_user_id;

  -- If no purchase found, return false
  IF v_current_status IS NULL THEN
    RETURN false;
  END IF;

  -- Validate current status
  IF NOT v_is_valid_status THEN
    RAISE EXCEPTION 'Invalid current status in database: %', v_current_status;
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
      status = p_new_status::text,
      version = version + 1,
      updated_at = now()
    WHERE id = p_purchase_id
      AND user_id = p_user_id
      AND status = p_current_status
      AND version = p_version
    RETURNING id
  )
  SELECT EXISTS (SELECT 1 FROM updated) INTO v_updated;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_purchase_status_v2 TO authenticated;