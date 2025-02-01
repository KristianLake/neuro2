-- Drop existing foreign key if it exists
ALTER TABLE purchases 
DROP CONSTRAINT IF EXISTS purchases_user_id_fkey;

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_purchases_user_id;

-- Add foreign key constraint to auth.users instead of public.users
ALTER TABLE purchases
ADD CONSTRAINT purchases_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_purchases_user_id
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