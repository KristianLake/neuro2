-- Drop functions that depend on content_type first
DROP FUNCTION IF EXISTS get_user_content_access(uuid);
DROP FUNCTION IF EXISTS get_user_content_access_v2(uuid);
DROP FUNCTION IF EXISTS manage_content_access(uuid, uuid, timestamptz);
DROP FUNCTION IF EXISTS revoke_content_access(uuid, uuid);
DROP FUNCTION IF EXISTS check_content_access(uuid, uuid);

-- Drop content management system tables
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS content_tier_requirements CASCADE;
DROP TABLE IF EXISTS content_relationships CASCADE;
DROP TABLE IF EXISTS access_tiers CASCADE;
DROP TABLE IF EXISTS content CASCADE;

-- Now we can safely drop the enum type
DROP TYPE IF EXISTS content_type;

-- Log cleanup
DO $$ BEGIN
  RAISE NOTICE 'Content management system removed successfully';
END $$;