-- Create lesson content for Module 1
INSERT INTO content_drafts (
  content_id,
  version,
  data,
  status,
  visibility,
  created_by,
  updated_by
) VALUES
-- Introduction Lesson
(
  'module-1/introduction',
  1,
  jsonb_build_object(
    'title', 'Introduction to Programming',
    'description', 'Your first steps into programming',
    'type', 'interactive',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'what-is-programming',
        'title', 'What is Programming?',
        'content', 'Programming is like giving instructions to a computer...'
      ),
      jsonb_build_object(
        'id', 'first-program',
        'title', 'Your First Program',
        'content', 'Let''s write our first program...'
      ),
      jsonb_build_object(
        'id', 'common-questions',
        'title', 'Common Questions',
        'content', 'Answers to frequently asked questions...'
      ),
      jsonb_build_object(
        'id', 'next-steps',
        'title', 'Next Steps',
        'content', 'What''s coming up next...'
      )
    ),
    'achievements', jsonb_build_array(
      'first-program',
      'hello-coder',
      'quick-learner',
      'code-explorer',
      'creative-coder',
      'personalized-hello'
    )
  ),
  'published',
  'public',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
),
-- Variables Lesson
(
  'module-1/variables',
  1,
  jsonb_build_object(
    'title', 'Variables and Data Types',
    'description', 'Understanding different types of data',
    'type', 'interactive',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'variables-intro',
        'title', 'What are Variables?',
        'content', 'Variables are like labeled boxes...'
      ),
      jsonb_build_object(
        'id', 'data-types',
        'title', 'Types of Data',
        'content', 'Different kinds of information...'
      ),
      jsonb_build_object(
        'id', 'advanced-types',
        'title', 'More Data Types',
        'content', 'Arrays, objects, and special values...'
      ),
      jsonb_build_object(
        'id', 'variable-exercises',
        'title', 'Practice with Variables',
        'content', 'Let''s try using variables...'
      )
    ),
    'achievements', jsonb_build_array(
      'variable-master',
      'string-sage',
      'number-ninja',
      'boolean-boss',
      'array-ace',
      'object-expert',
      'name-wizard',
      'value-changer',
      'null-navigator'
    )
  ),
  'published',
  'restricted',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
);

-- Create access rules
INSERT INTO content_access_rules (
  content_id,
  rule_type,
  rule_value
) VALUES
-- Introduction is public
(
  'module-1/introduction',
  'role',
  '["user", "admin", "instructor"]'::jsonb
),
-- Variables requires module access
(
  'module-1/variables',
  'module',
  jsonb_build_object(
    'module_id', 'module-1'
  )
);