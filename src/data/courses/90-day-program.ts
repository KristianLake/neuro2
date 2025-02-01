import { Course } from '../../components/course/types';

export const NINETY_DAY_PROGRAM: Course = {
  id: '90-day-program',
  title: 'The 90-Day Web Developer Program',
  description: 'Master web development with our structured, neurodivergent-friendly approach.',
  modules: [
    {
      id: 'module-1',
      title: 'Programming Primer',
      description: 'Foundation module focusing on programming basics with a neurodivergent-friendly approach.',
      order: 1,
      contents: [
        {
          id: 'introduction',
          title: 'Introduction to Programming',
          description: 'Your first steps into programming',
          type: 'interactive',
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          author: 'Kristian Lake',
          estimatedTime: 45,
          difficulty: 'beginner',
          prerequisites: [],
          nextContent: 'variables'
        },
        {
          id: 'variables',
          title: 'Variables and Data Types',
          description: 'Understanding different types of data',
          type: 'interactive',
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          author: 'Kristian Lake',
          estimatedTime: 60,
          difficulty: 'beginner',
          prerequisites: ['introduction'],
          previousContent: 'introduction',
          nextContent: 'functions'
        }
      ],
      prerequisites: [],
      objectives: [
        'Understand programming fundamentals',
        'Master variables and data types',
        'Learn control structures',
        'Write basic functions'
      ]
    },
    {
      id: 'module-2',
      title: 'TypeScript Navigator',
      description: 'Introduction to TypeScript fundamentals and setup.',
      order: 2,
      contents: [
        {
          id: 'typescript-intro',
          title: 'TypeScript Introduction',
          description: 'Getting started with TypeScript',
          type: 'interactive',
          version: '1.0.0',
          lastUpdated: new Date().toISOString(),
          author: 'Kristian Lake',
          estimatedTime: 45,
          difficulty: 'beginner',
          prerequisites: ['module-1'],
          nextContent: 'static-typing'
        }
      ],
      prerequisites: ['module-1'],
      objectives: [
        'Understand TypeScript basics',
        'Master type annotations',
        'Learn interfaces and types',
        'Implement error handling'
      ]
    }
  ],
  metadata: {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    author: 'Kristian Lake',
    difficulty: 'beginner',
    estimatedTime: 90,
    tags: ['web-development', 'typescript', 'react']
  }
};