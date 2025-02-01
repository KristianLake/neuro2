-- Create content_bookmarks table
CREATE TABLE content_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content_id text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- Create content_views table
CREATE TABLE content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content_id text NOT NULL,
  viewed_at timestamptz DEFAULT now(),
  time_spent integer NOT NULL, -- in seconds
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE content_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- Create policies for content_bookmarks
CREATE POLICY "Users can manage own bookmarks"
  ON content_bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for content_views
CREATE POLICY "Users can manage own content views"
  ON content_views
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all content views"
  ON content_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_content_bookmarks_user_content 
ON content_bookmarks(user_id, content_id);

CREATE INDEX idx_content_views_user_content 
ON content_views(user_id, content_id);

CREATE INDEX idx_content_views_viewed_at 
ON content_views(viewed_at DESC);

-- Create trigger for updated_at on bookmarks
CREATE TRIGGER update_content_bookmarks_updated_at
  BEFORE UPDATE ON content_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get content engagement metrics
CREATE OR REPLACE FUNCTION get_content_engagement_metrics(
  p_content_id text,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_metrics jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_views', COUNT(DISTINCT user_id),
    'completion_rate', (COUNT(*) FILTER (WHERE completed) * 100.0 / NULLIF(COUNT(*), 0)),
    'avg_time_spent', AVG(time_spent),
    'total_bookmarks', (
      SELECT COUNT(*)
      FROM content_bookmarks cb
      WHERE cb.content_id = p_content_id
      AND (p_start_date IS NULL OR cb.created_at >= p_start_date)
      AND (p_end_date IS NULL OR cb.created_at <= p_end_date)
    )
  )
  INTO v_metrics
  FROM content_views
  WHERE content_id = p_content_id
  AND (p_start_date IS NULL OR viewed_at >= p_start_date)
  AND (p_end_date IS NULL OR viewed_at <= p_end_date);

  RETURN v_metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON content_bookmarks TO authenticated;
GRANT SELECT, INSERT ON content_views TO authenticated;
GRANT EXECUTE ON FUNCTION get_content_engagement_metrics TO authenticated;