-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_purchase_completion ON purchases;
DROP TRIGGER IF EXISTS purchase_status_transition ON purchases;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_purchase_completion();
DROP FUNCTION IF EXISTS check_purchase_status_transition();
DROP FUNCTION IF EXISTS update_purchase_status();

-- Add version column if it doesn't exist
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

-- Create function to handle purchase completion
CREATE OR REPLACE FUNCTION handle_purchase_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get product type
    DECLARE
      product_type text;
    BEGIN
      SELECT type INTO product_type
      FROM products
      WHERE id = NEW.product_id;

      -- If it's a module purchase, grant access
      IF product_type = 'module' THEN
        INSERT INTO course_access (user_id, module_id)
        VALUES (NEW.user_id, NEW.product_id)
        ON CONFLICT (user_id, module_id) DO NOTHING;
      -- If it's a course purchase, grant access to all modules
      ELSIF product_type = 'course' THEN
        -- Insert access for all modules
        INSERT INTO course_access (user_id, module_id)
        SELECT 
          NEW.user_id,
          'module-' || generate_series(1, 9)
        ON CONFLICT (user_id, module_id) DO NOTHING;
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check status transitions
CREATE OR REPLACE FUNCTION check_purchase_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow specific status transitions
  IF OLD.status = 'pending' AND NEW.status NOT IN ('completed', 'failed') THEN
    RAISE EXCEPTION 'Invalid status transition from pending to %', NEW.status;
  END IF;

  IF OLD.status = 'completed' AND NEW.status != 'refunded' THEN
    RAISE EXCEPTION 'Completed purchase can only transition to refunded';
  END IF;

  IF OLD.status IN ('failed', 'refunded') THEN
    RAISE EXCEPTION 'Cannot change status of failed or refunded purchase';
  END IF;

  -- Increment version for optimistic locking
  NEW.version := OLD.version + 1;
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for atomic status updates
CREATE OR REPLACE FUNCTION update_purchase_status(
  p_purchase_id uuid,
  p_user_id uuid,
  p_current_status text,
  p_new_status text,
  p_version integer
)
RETURNS boolean AS $$
DECLARE
  v_updated boolean;
BEGIN
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

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER purchase_status_transition
  BEFORE UPDATE OF status
  ON purchases
  FOR EACH ROW
  EXECUTE FUNCTION check_purchase_status_transition();

CREATE TRIGGER on_purchase_completion
  AFTER UPDATE ON purchases
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION handle_purchase_completion();

-- Create index for status updates if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_purchases_status_updates
ON purchases(id, user_id, status, version);

-- Update existing purchases to have version numbers if needed
UPDATE purchases SET version = 1 WHERE version IS NULL;