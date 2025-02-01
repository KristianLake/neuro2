-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;

-- Create index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_progress_user_content 
ON user_progress(user_id, content_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_progress TO authenticated;