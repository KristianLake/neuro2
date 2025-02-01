-- Add content_id to course_access table
ALTER TABLE course_access
ADD COLUMN IF NOT EXISTS content_id uuid REFERENCES content(id);

-- Create function to manage content access
CREATE OR REPLACE FUNCTION manage_content_access(
  p_user_id uuid,
  p_content_id uuid,
  p_expires_at timestamptz DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  _content_type content_type;
  _module_id text;
BEGIN
  -- Get content type
  SELECT type INTO _content_type
  FROM content
  WHERE id = p_content_id;

  -- Handle different content types
  CASE _content_type
    WHEN 'module' THEN
      -- For modules, grant direct access
      _module_id := 'module-' || (
        SELECT order_number::text
        FROM content
        WHERE id = p_content_id
      );
      
      PERFORM manage_course_access(p_user_id, _module_id, p_expires_at);
      
    WHEN 'course' THEN
      -- For courses, grant access to all modules
      INSERT INTO course_access (user_id, module_id, content_id, expires_at)
      SELECT 
        p_user_id,
        'module-' || c.order_number,
        c.id,
        p_expires_at
      FROM content c
      WHERE c.type = 'module'
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET 
        expires_at = EXCLUDED.expires_at,
        content_id = EXCLUDED.content_id;
      
    WHEN 'masterclass' THEN
      -- For masterclasses, grant access to specific content
      INSERT INTO course_access (user_id, module_id, content_id, expires_at)
      VALUES (p_user_id, p_content_id::text, p_content_id, p_expires_at)
      ON CONFLICT (user_id, module_id) 
      DO UPDATE SET 
        expires_at = EXCLUDED.expires_at,
        content_id = EXCLUDED.content_id;
      
    ELSE
      RAISE EXCEPTION 'Unsupported content type: %', _content_type;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to revoke content access
CREATE OR REPLACE FUNCTION revoke_content_access(
  p_user_id uuid,
  p_content_id uuid
)
RETURNS void AS $$
DECLARE
  _content_type content_type;
BEGIN
  -- Get content type
  SELECT type INTO _content_type
  FROM content
  WHERE id = p_content_id;

  -- Handle different content types
  CASE _content_type
    WHEN 'module' THEN
      -- For modules, revoke direct access
      DELETE FROM course_access
      WHERE user_id = p_user_id
      AND content_id = p_content_id;
      
    WHEN 'course' THEN
      -- For courses, revoke access to all related modules
      DELETE FROM course_access
      WHERE user_id = p_user_id
      AND content_id IN (
        SELECT id
        FROM content
        WHERE type = 'module'
      );
      
    WHEN 'masterclass' THEN
      -- For masterclasses, revoke specific content access
      DELETE FROM course_access
      WHERE user_id = p_user_id
      AND content_id = p_content_id;
      
    ELSE
      RAISE EXCEPTION 'Unsupported content type: %', _content_type;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check content access
CREATE OR REPLACE FUNCTION check_content_access(
  p_user_id uuid,
  p_content_id uuid
)
RETURNS boolean AS $$
DECLARE
  _content_type content_type;
BEGIN
  -- Get content type
  SELECT type INTO _content_type
  FROM content
  WHERE id = p_content_id;

  RETURN EXISTS (
    SELECT 1 
    FROM course_access ca
    WHERE ca.user_id = p_user_id
    AND (
      ca.content_id = p_content_id
      OR 
      (
        _content_type = 'module' 
        AND ca.module_id = 'module-' || (
          SELECT order_number::text
          FROM content
          WHERE id = p_content_id
        )
      )
      OR
      (
        _content_type = 'lesson'
        AND EXISTS (
          SELECT 1
          FROM content_relationships cr
          WHERE cr.child_id = p_content_id
          AND EXISTS (
            SELECT 1
            FROM course_access ca2
            WHERE ca2.content_id = cr.parent_id
            AND ca2.user_id = p_user_id
          )
        )
      )
    )
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's content access with hierarchy
CREATE OR REPLACE FUNCTION get_user_content_access_v2(p_user_id uuid)
RETURNS TABLE (
  content_id uuid,
  content_type content_type,
  title text,
  description text,
  parent_id uuid,
  order_number integer,
  access_level text,
  granted_at timestamptz,
  expires_at timestamptz,
  progress numeric,
  status text
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE content_tree AS (
    -- Get top-level content
    SELECT 
      c.id,
      c.type,
      c.title,
      c.description,
      c.parent_id,
      c.order_number,
      1 as level
    FROM content c
    WHERE c.parent_id IS NULL
    
    UNION ALL
    
    -- Get child content
    SELECT 
      c.id,
      c.type,
      c.title,
      c.description,
      c.parent_id,
      c.order_number,
      ct.level + 1
    FROM content c
    JOIN content_tree ct ON c.parent_id = ct.id
  )
  SELECT 
    ct.id,
    ct.type,
    ct.title,
    ct.description,
    ct.parent_id,
    ct.order_number,
    CASE 
      WHEN ca.module_id LIKE 'full-course-premium%' THEN 'premium'
      WHEN ca.module_id LIKE 'full-course%' THEN 'standard'
      ELSE 'module'
    END as access_level,
    ca.created_at,
    ca.expires_at,
    COALESCE(up.progress, 0),
    COALESCE(up.status, 'not_started')
  FROM content_tree ct
  LEFT JOIN course_access ca ON 
    ca.content_id = ct.id 
    AND ca.user_id = p_user_id
    AND (ca.expires_at IS NULL OR ca.expires_at > now())
  LEFT JOIN user_progress up ON 
    up.content_id = ct.id 
    AND up.user_id = p_user_id
  ORDER BY ct.level, ct.order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION manage_content_access TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_content_access TO authenticated;
GRANT EXECUTE ON FUNCTION check_content_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_content_access_v2 TO authenticated;