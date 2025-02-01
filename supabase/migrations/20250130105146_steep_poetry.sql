-- Drop existing objects if they exist
DO $$ BEGIN
  -- Drop dependent objects first
  DROP TABLE IF EXISTS content_reviews CASCADE;
  DROP TABLE IF EXISTS content_drafts CASCADE;
  DROP TABLE IF EXISTS content_access_rules CASCADE;
END $$;

-- Create content_drafts table
CREATE TABLE content_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  version integer NOT NULL,
  data jsonb NOT NULL,
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
  draft_id uuid REFERENCES content_drafts(id) NOT NULL,
  reviewer_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content_access_rules table
CREATE TABLE content_access_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  rule_type text NOT NULL CHECK (rule_type IN ('role', 'module', 'date')),
  rule_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for content_drafts
CREATE POLICY "Content creators can manage drafts"
  ON content_drafts
  FOR ALL
  TO authenticated
  USING (
    created_by = auth.uid() OR
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

-- Create policies for content_access_rules
CREATE POLICY "Admins can manage access rules"
  ON content_access_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_content_drafts_content_version 
ON content_drafts(content_id, version DESC);

CREATE INDEX idx_content_drafts_status 
ON content_drafts(status);

CREATE INDEX idx_content_drafts_publish_at 
ON content_drafts(publish_at)
WHERE publish_at IS NOT NULL AND status = 'approved';

CREATE INDEX idx_content_reviews_draft 
ON content_reviews(draft_id);

CREATE INDEX idx_content_access_rules_content 
ON content_access_rules(content_id);

-- Create function to check content access
CREATE OR REPLACE FUNCTION check_content_access(
  p_content_id text,
  p_user_id uuid
)
RETURNS boolean AS $$
DECLARE
  v_draft content_drafts%ROWTYPE;
  v_user_role text;
  v_rule content_access_rules%ROWTYPE;
BEGIN
  -- Get content draft
  SELECT * INTO v_draft
  FROM content_drafts
  WHERE content_id = p_content_id
  AND status = 'published'
  ORDER BY version DESC
  LIMIT 1;

  -- If no published version exists, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If content is public, return true
  IF v_draft.visibility = 'public' THEN
    RETURN true;
  END IF;

  -- Get user role
  SELECT role INTO v_user_role
  FROM users
  WHERE id = p_user_id;

  -- Check access rules
  FOR v_rule IN
    SELECT *
    FROM content_access_rules
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
  v_draft content_drafts%ROWTYPE;
BEGIN
  -- Get latest approved version
  SELECT * INTO v_draft
  FROM content_drafts
  WHERE content_id = p_content_id
  AND status = 'approved'
  ORDER BY version DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No approved version found for content %', p_content_id;
  END IF;

  -- Update state to published
  UPDATE content_drafts
  SET 
    status = 'published',
    publish_at = p_publish_at,
    published_at = CASE WHEN p_publish_at IS NULL THEN now() ELSE NULL END,
    updated_by = p_user_id,
    updated_at = now()
  WHERE content_id = v_draft.content_id
  AND version = v_draft.version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON content_drafts TO authenticated;
GRANT SELECT ON content_reviews TO authenticated;
GRANT SELECT ON content_access_rules TO authenticated;
GRANT EXECUTE ON FUNCTION check_content_access TO authenticated;
GRANT EXECUTE ON FUNCTION publish_content TO authenticated;