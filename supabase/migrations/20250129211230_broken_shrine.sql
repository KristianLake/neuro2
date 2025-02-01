-- Migrate any existing access audit logs to the main audit_logs table
INSERT INTO audit_logs (
  action,
  user_id,
  target_id,
  target_type,
  details,
  created_at
)
SELECT 
  'ACCESS_' || issue_type as action,
  user_id,
  COALESCE(purchase_id::text, module_id),
  CASE 
    WHEN purchase_id IS NOT NULL THEN 'purchase'
    ELSE 'module'
  END as target_type,
  details,
  created_at
FROM access_audit_log;

-- Drop the redundant access audit log table
DROP TABLE IF EXISTS access_audit_log CASCADE;

-- Drop the now-unused function
DROP FUNCTION IF EXISTS log_access_issue(uuid, uuid, text, text, jsonb);

-- Log consolidation
DO $$ BEGIN
  RAISE NOTICE 'Audit logs consolidated successfully';
END $$;