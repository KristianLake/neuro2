-- Create view for active sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
  s.*,
  u.email,
  u.user_metadata->>'full_name' as user_name
FROM auth_sessions s
JOIN users u ON u.id = s.user_id
WHERE s.is_active = true
AND s.expires_at > now();

-- Create view for suspicious activities
CREATE OR REPLACE VIEW suspicious_activities AS
WITH location_changes AS (
  SELECT 
    user_id,
    count(DISTINCT location->>'country') as country_count,
    count(DISTINCT ip_address) as ip_count
  FROM auth_sessions
  WHERE created_at > now() - interval '24 hours'
  GROUP BY user_id
  HAVING count(DISTINCT location->>'country') > 2
  OR count(DISTINCT ip_address) > 5
),
failed_logins AS (
  SELECT 
    user_id,
    count(*) as failed_count
  FROM audit_logs
  WHERE action = 'login_failed'
  AND created_at > now() - interval '1 hour'
  GROUP BY user_id
  HAVING count(*) >= 3
)
SELECT 
  u.id as user_id,
  u.email,
  u.user_metadata->>'full_name' as user_name,
  COALESCE(l.country_count, 0) as country_count,
  COALESCE(l.ip_count, 0) as ip_count,
  COALESCE(f.failed_count, 0) as failed_login_count,
  u.locked_until,
  u.last_login_at
FROM users u
LEFT JOIN location_changes l ON l.user_id = u.id
LEFT JOIN failed_logins f ON f.user_id = u.id
WHERE 
  l.user_id IS NOT NULL 
  OR f.user_id IS NOT NULL
  OR u.locked_until > now();

-- Create view for unread notifications
CREATE OR REPLACE VIEW unread_notifications AS
SELECT 
  n.*,
  u.email,
  u.user_metadata->>'full_name' as user_name
FROM auth_notifications n
JOIN users u ON u.id = n.user_id
WHERE n.read_at IS NULL
ORDER BY n.created_at DESC;

-- Grant access to views
GRANT SELECT ON active_sessions TO authenticated;
GRANT SELECT ON suspicious_activities TO authenticated;
GRANT SELECT ON unread_notifications TO authenticated;