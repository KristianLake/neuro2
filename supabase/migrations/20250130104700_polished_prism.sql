-- Create content_states table
CREATE TABLE content_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  visibility text NOT NULL CHECK (visibility IN ('private', 'restricted', 'public')),
  publish_at timestamptz,
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid REFERENCES auth.users NOT NULL,
  updated_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_id, version)
);

-- Create content_reviews table
CREATE TABLE content_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  version integer NOT NULL,
  reviewer_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (content_id, version) REFERENCES content_states(content_id, version)
);

-- Create content_visibility_rules table
CREATE TABLE content_visibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('role', 'module', 'date')),
  rule_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_visibility_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for content_states
CREATE POLICY "Admins can manage content states"
  ON content_states
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Content creators can view and update own content"
  ON content_states
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Content creators can create drafts"
  ON content_states
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'draft' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'instructor')
    )
  );

-- Create policies for content_reviews
CREATE POLICY "Reviewers can manage reviews"
  ON content_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Content creators can view reviews of their content"
  ON content_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM content_states cs
      WHERE cs.content_id = content_reviews.content_id
      AND cs.version = content_reviews.version
      AND cs.created_by = auth.uid()
    )
  );

-- Create policies for content_visibility_rules
CREATE POLICY "Admins can manage visibility rules"
  ON content_visibility_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_content_states_content_version 
ON content_states(content_id, version);

CREATE INDEX idx_content_states_status 
ON content_states(status);

CREATE INDEX idx_content_states_publish_at 
ON content_states(publish_at)
WHERE publish_at IS NOT NULL AND status = 'approved';

CREATE INDEX idx_content_reviews_content_version 
ON content_reviews(content_id, version);

CREATE INDEX idx_content_visibility_rules_content 
ON content_visibility_rules(content_id);

-- Create function to check content visibility
CREATE OR REPLACE FUNCTION check_content_visibility(
  p_content_id text,
  p_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_state content_states%ROWTYPE;
  v_user_role text;
  v_rule content_visibility_rules%ROWTYPE;
BEGIN
  -- Get content state
  SELECT * INTO v_state
  FROM content_states
  WHERE content_id = p_content_id
  AND status = 'published'
  ORDER BY version DESC
  LIMIT 1;

  -- If no published version exists, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If content is public, return true
  IF v_state.visibility = 'public' THEN
    RETURN true;
  END IF;

  -- Get user role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = p_user_id;

  -- Check visibility rules
  FOR v_rule IN
    SELECT *
    FROM content_visibility_rules
    WHERE content_id = p_content_id
  LOOP
    CASE v_rule.rule_type
      WHEN 'role' THEN
        IF v_user_role = ANY(v_rule.rule_value::text[]) THEN
          RETURN true;
        END IF;
      WHEN 'module' THEN
        IF EXISTS (
          SELECT 1 FROM course_access
          WHERE user_id = p_user_id
          AND module_id = v_rule.rule_value->>'module_id'
          AND (expires_at IS NULL OR expires_at > now())
        ) THEN
          RETURN true;
        END IF;
      WHEN 'date' THEN
        IF now() >= (v_rule.rule_value->>'start_date')::timestamptz
        AND (
          (v_rule.rule_value->>'end_date') IS NULL
          OR now() <= (v_rule.rule_value->>'end_date')::timestamptz
        ) THEN
          RETURN true;
        END IF;
    END CASE;
  END LOOP;

  -- If no rules matched, return false for restricted content
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to publish content
CREATE OR REPLACE FUNCTION publish_content(
  p_content_id text,
  p_user_id uuid,
  p_publish_at timestamptz DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_state content_states%ROWTYPE;
BEGIN
  -- Get latest approved version
  SELECT * INTO v_state
  FROM content_states
  WHERE content_id = p_content_id
  AND status = 'approved'
  ORDER BY version DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No approved version found for content %', p_content_id;
  END IF;

  -- Update state to published
  UPDATE content_states
  SET 
    status = 'published',
    publish_at = p_publish_at,
    published_at = CASE WHEN p_publish_at IS NULL THEN now() ELSE NULL END,
    updated_by = p_user_id,
    updated_at = now()
  WHERE content_id = v_state.content_id
  AND version = v_state.version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON content_states TO authenticated;
GRANT SELECT ON content_reviews TO authenticated;
GRANT SELECT ON content_visibility_rules TO authenticated;
GRANT EXECUTE ON FUNCTION check_content_visibility TO authenticated;
GRANT EXECUTE ON FUNCTION publish_content TO authenticated;