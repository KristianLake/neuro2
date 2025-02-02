/*
  # Update purchases table relationships and policies

  1. Changes
    - Add foreign key constraint if it doesn't exist
    - Update RLS policies
    - Add indexes for performance
  
  2. Security
    - Enable RLS
    - Add policies for users and admins
*/

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'purchases_user_id_fkey'
  ) THEN
    ALTER TABLE purchases
    ADD CONSTRAINT purchases_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id
ON purchases(user_id);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can create own purchases" ON purchases;
DROP POLICY IF EXISTS "Only admins can update purchases" ON purchases;

CREATE POLICY "Users can view own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can create own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON purchases TO authenticated;
GRANT INSERT ON purchases TO authenticated;