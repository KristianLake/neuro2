-- No-op migration (content management system removed)
DO $$ BEGIN
  -- This is an empty migration that will successfully apply
  -- without making any changes to the database structure
  RAISE NOTICE 'Content management system migrations removed';
END $$;