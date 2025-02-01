import { Course } from '../types/content';

export const COURSES: Record<string, Course> = {
  'full-course': {
    id: 'full-course',
    slug: 'web-developer-program',
    type: 'complete',
    title: 'The 90-Day Web Developer Program',
    description: 'Master web development with our structured, neurodivergent-friendly approach.',
    price: 2497,
    modules: [
      {
        id: 'full-course-module-1',
        courseId: 'full-course',
        slug: 'programming-primer',
        title: 'Programming Primer',
        description: 'Master programming basics with ease and gain the confidence to progress.',
        order: 1,
        price: 197,
        lessons: [
          {
            id: 'full-course-module-1-lesson-1',
            moduleId: 'full-course-module-1',
            courseId: 'full-course',
            slug: 'introduction',
            title: 'Introduction to Programming',
            description: 'Your first steps into programming',
            order: 1,
            isPremium: false,
            path: '/lessons/full-course/programming-primer/introduction'
          },
          {
            id: 'full-course-module-1-lesson-2',
            moduleId: 'full-course-module-1',
            courseId: 'full-course',
            slug: 'variables',
            title: 'Variables and Data Types',
            description: 'Understanding different types of data',
            order: 2,
            isPremium: true,
            path: '/lessons/full-course/programming-primer/variables'
          }
        ]
      },
      {
        id: 'full-course-module-2',
        courseId: 'full-course',
        slug: 'typescript-navigator',
        title: 'TypeScript Navigator',
        description: 'Confidently set up TypeScript and unlock advanced skills.',
        order: 2,
        price: 247,
        lessons: [
          {
            id: 'full-course-module-2-lesson-1',
            moduleId: 'full-course-module-2',
            courseId: 'full-course',
            slug: 'typescript-basics',
            title: 'TypeScript Basics',
            description: 'Getting started with TypeScript',
            order: 1,
            isPremium: true,
            path: '/lessons/full-course/typescript-navigator/basics'
          }
        ]
      }
    ]
  },
  'web-basics': {
    id: 'web-basics',
    slug: 'web-basics',
    type: 'mini',
    title: 'Web Basics Bundle',
    description: 'Essential web development fundamentals',
    price: 247,
    modules: [
      {
        id: 'web-basics-module-1',
        courseId: 'web-basics',
        slug: 'html-fundamentals',
        title: 'HTML Fundamentals',
        description: 'Learn the building blocks of web pages',
        order: 1,
        price: 97,
        lessons: [
          {
            id: 'web-basics-module-1-lesson-1',
            moduleId: 'web-basics-module-1',
            courseId: 'web-basics',
            slug: 'html-intro',
            title: 'HTML Introduction',
            description: 'Getting started with HTML',
            order: 1,
            isPremium: true,
            path: '/lessons/web-basics/html-fundamentals/intro'
          }
        ]
      }
    ]
  }
};