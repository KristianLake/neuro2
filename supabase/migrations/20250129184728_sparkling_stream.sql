-- Create content types enum
CREATE TYPE content_type AS ENUM ('lesson', 'module', 'course', 'mini-course', 'masterclass');

-- Create content table
CREATE TABLE content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type content_type NOT NULL,
  parent_id uuid REFERENCES content(id),
  order_number integer NOT NULL DEFAULT 1,
  price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content relationships table
CREATE TABLE content_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES content(id) NOT NULL,
  child_id uuid REFERENCES content(id) NOT NULL,
  order_number integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Create content access tiers table
CREATE TABLE access_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  level integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content tier requirements table
CREATE TABLE content_tier_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES content(id) NOT NULL,
  tier_id uuid REFERENCES access_tiers(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, tier_id)
);

-- Create user progress table
CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content_id uuid REFERENCES content(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress numeric DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_accessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tier_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Content is viewable by everyone"
  ON content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify content"
  ON content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Content relationships are viewable by everyone"
  ON content_relationships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify content relationships"
  ON content_relationships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Access tiers are viewable by everyone"
  ON access_tiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify access tiers"
  ON access_tiers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Content tier requirements are viewable by everyone"
  ON content_tier_requirements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify content tier requirements"
  ON content_tier_requirements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_content_parent_id ON content(parent_id);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_relationships_parent ON content_relationships(parent_id);
CREATE INDEX idx_content_relationships_child ON content_relationships(child_id);
CREATE INDEX idx_content_tier_requirements_content ON content_tier_requirements(content_id);
CREATE INDEX idx_content_tier_requirements_tier ON content_tier_requirements(tier_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_content ON user_progress(content_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);

-- Create function to get user's content access
CREATE OR REPLACE FUNCTION get_user_content_access(p_user_id uuid)
RETURNS TABLE (
  content_id uuid,
  content_type content_type,
  title text,
  access_level text,
  granted_at timestamptz,
  expires_at timestamptz,
  progress numeric,
  status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as content_id,
    c.type as content_type,
    c.title,
    CASE 
      WHEN ca.module_id LIKE 'full-course-premium%' THEN 'premium'
      WHEN ca.module_id LIKE 'full-course%' THEN 'standard'
      ELSE 'module'
    END as access_level,
    ca.created_at as granted_at,
    ca.expires_at,
    COALESCE(up.progress, 0) as progress,
    COALESCE(up.status, 'not_started') as status
  FROM content c
  JOIN course_access ca ON 
    (c.id::text = ca.module_id OR 
     (ca.module_id LIKE 'full-course%' AND c.type = 'module'))
  LEFT JOIN user_progress up ON 
    up.content_id = c.id AND 
    up.user_id = p_user_id
  WHERE ca.user_id = p_user_id
  AND (ca.expires_at IS NULL OR ca.expires_at > now())
  ORDER BY c.type, c.order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON TYPE content_type TO authenticated;
GRANT SELECT ON content TO authenticated;
GRANT SELECT ON content_relationships TO authenticated;
GRANT SELECT ON access_tiers TO authenticated;
GRANT SELECT ON content_tier_requirements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_progress TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_content_access TO authenticated;