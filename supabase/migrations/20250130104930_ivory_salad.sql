-- Create content_versions table
CREATE TABLE content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  version integer NOT NULL,
  data jsonb NOT NULL,
  diff jsonb, -- Stores diff from previous version
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(content_id, version)
);

-- Create content_bulk_actions table
CREATE TABLE content_bulk_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL CHECK (action_type IN ('publish', 'unpublish', 'archive')),
  content_ids text[] NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_by uuid REFERENCES auth.users NOT NULL,
  completed_at timestamptz,
  error_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_bulk_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for content_versions
CREATE POLICY "Content creators can view versions"
  ON content_versions
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Content creators can create versions"
  ON content_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'instructor')
    )
  );

-- Create policies for content_bulk_actions
CREATE POLICY "Admins can manage bulk actions"
  ON content_bulk_actions
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
CREATE INDEX idx_content_versions_content_version 
ON content_versions(content_id, version DESC);

CREATE INDEX idx_content_bulk_actions_status 
ON content_bulk_actions(status);

-- Create function to get content version history
CREATE OR REPLACE FUNCTION get_content_version_history(
  p_content_id text,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  version integer,
  data jsonb,
  diff jsonb,
  created_by uuid,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cv.version,
    cv.data,
    cv.diff,
    cv.created_by,
    cv.created_at
  FROM content_versions cv
  WHERE cv.content_id = p_content_id
  ORDER BY cv.version DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle bulk content actions
CREATE OR REPLACE FUNCTION process_bulk_content_action(
  p_action_id uuid
)
RETURNS void AS $$
DECLARE
  v_action content_bulk_actions%ROWTYPE;
  v_content_id text;
  v_error_details jsonb := '[]'::jsonb;
BEGIN
  -- Get bulk action details
  SELECT * INTO v_action
  FROM content_bulk_actions
  WHERE id = p_action_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bulk action not found';
  END IF;

  -- Update status to in_progress
  UPDATE content_bulk_actions
  SET 
    status = 'in_progress',
    updated_at = now()
  WHERE id = p_action_id;

  -- Process each content item
  FOR v_content_id IN SELECT unnest(v_action.content_ids)
  LOOP
    BEGIN
      CASE v_action.action_type
        WHEN 'publish' THEN
          PERFORM publish_content(v_content_id, v_action.created_by);
        WHEN 'unpublish' THEN
          UPDATE content_states
          SET 
            status = 'draft',
            updated_by = v_action.created_by,
            updated_at = now()
          WHERE content_id = v_content_id
          AND status = 'published';
        WHEN 'archive' THEN
          UPDATE content_states
          SET 
            status = 'archived',
            archived_at = now(),
            updated_by = v_action.created_by,
            updated_at = now()
          WHERE content_id = v_content_id
          AND status = 'published';
      END CASE;
    EXCEPTION WHEN OTHERS THEN
      -- Add error to error_details
      v_error_details := v_error_details || jsonb_build_object(
        'content_id', v_content_id,
        'error', SQLERRM
      );
    END;
  END LOOP;

  -- Update bulk action status
  UPDATE content_bulk_actions
  SET 
    status = CASE 
      WHEN jsonb_array_length(v_error_details) = array_length(content_ids, 1) THEN 'failed'
      WHEN jsonb_array_length(v_error_details) > 0 THEN 'completed'
      ELSE 'completed'
    END,
    error_details = v_error_details,
    completed_at = now(),
    updated_at = now()
  WHERE id = p_action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON content_versions TO authenticated;
GRANT SELECT ON content_bulk_actions TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_version_history TO authenticated;
GRANT EXECUTE ON FUNCTION process_bulk_content_action TO authenticated;