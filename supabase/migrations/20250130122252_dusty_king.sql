-- Add details column to user_progress table
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_details 
ON user_progress USING gin(details);

-- Update RLS policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

-- Create policies
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_progress TO authenticated;