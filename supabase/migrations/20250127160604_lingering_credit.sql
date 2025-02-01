-- Create products table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'products') THEN
    CREATE TABLE products (
      id text PRIMARY KEY,
      name text NOT NULL,
      description text,
      type text NOT NULL CHECK (type IN ('module', 'course')),
      price numeric NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Create purchases table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'purchases') THEN
    CREATE TABLE purchases (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      product_id text REFERENCES products(id) NOT NULL,
      amount numeric NOT NULL,
      status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view products" ON products;
DROP POLICY IF EXISTS "Only admins can modify products" ON products;
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can create own purchases" ON purchases;
DROP POLICY IF EXISTS "Only admins can update purchases" ON purchases;

-- Create policies for products
CREATE POLICY "Everyone can view products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policies for purchases
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

-- Create indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_user_id') THEN
    CREATE INDEX idx_purchases_user_id ON purchases(user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_product_id') THEN
    CREATE INDEX idx_purchases_product_id ON purchases(product_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_purchases_status') THEN
    CREATE INDEX idx_purchases_status ON purchases(status);
  END IF;
END $$;

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_purchase_completion ON purchases;
DROP FUNCTION IF EXISTS handle_purchase_completion();

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

-- Create trigger for purchase completion
CREATE TRIGGER on_purchase_completion
  AFTER UPDATE ON purchases
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION handle_purchase_completion();

-- Insert or update product data
INSERT INTO products (id, name, description, type, price) VALUES
  ('module-1', 'Programming Primer', 'Foundation module focusing on programming basics with a neurodivergent-friendly approach.', 'module', 197),
  ('module-2', 'TypeScript Navigator', 'Introduction to TypeScript fundamentals and setup.', 'module', 247),
  ('module-3', 'Syntax Sculptor', 'Advanced TypeScript syntax and patterns.', 'module', 297),
  ('module-4', 'React Catalyst', 'Introduction to React fundamentals.', 'module', 347),
  ('module-5', 'TypeScript Fusion', 'Integrating TypeScript with React.', 'module', 397),
  ('module-6', 'State Sorcerer', 'Advanced state management in React.', 'module', 447),
  ('module-7', 'Project Architect', 'Building real-world applications.', 'module', 497),
  ('module-8', 'API Alchemist', 'API integration and data management.', 'module', 547),
  ('module-9', 'Career Blueprint', 'Job preparation and career development.', 'module', 597),
  ('full-course', 'The 90-Day Web Developer Program', 'Complete web development course designed for neurodivergent learners', 'course', 2497),
  ('full-course-premium', 'The 90-Day Web Developer Program (Premium)', 'Complete course with 1:1 coaching and career support', 'course', 3997)
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  price = EXCLUDED.price,
  updated_at = now();

-- Grant permissions
GRANT SELECT ON products TO authenticated;
GRANT SELECT, INSERT ON purchases TO authenticated;