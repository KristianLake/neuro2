import { Achievement } from '../types/achievements';

// Combined achievements list
export const ACHIEVEMENTS: Achievement[] = [
  // Introduction achievements
  {
    id: 'first-program',
    title: 'First Program',
    description: 'Ran your first program successfully!',
    xp: 50,
    icon: '🚀',
    lessonPath: '/lessons/full-course/programming-primer/introduction'
  },
  {
    id: 'hello-coder',
    title: 'Hello, Coder!',
    description: 'Started your coding journey with your first program',
    xp: 25,
    icon: '👋',
    lessonPath: '/lessons/full-course/programming-primer/introduction'
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Successfully ran code on your first try',
    xp: 25,
    icon: '⚡',
    lessonPath: '/lessons/introduction'
  },
  {
    id: 'code-explorer',
    title: 'Code Explorer',
    description: 'Modified and ran the example code 3 times',
    xp: 30,
    icon: '🔍',
    lessonPath: '/lessons/introduction'
  },
  {
    id: 'creative-coder',
    title: 'Creative Coder',
    description: 'Created a unique message using console.log',
    xp: 35,
    icon: '🎨',
    lessonPath: '/lessons/introduction'
  },
  {
    id: 'personalized-hello',
    title: 'Making It Personal',
    description: 'Personalized your Hello World message',
    xp: 20,
    icon: '✨',
    lessonPath: '/lessons/introduction'
  },
  // Comment achievements
  {
    id: 'comment-master',
    title: 'Comment Master',
    description: 'Successfully used both single-line and multi-line comments',
    xp: 30,
    icon: '📝',
    lessonPath: '/learn/comments'
  },
  {
    id: 'code-documenter',
    title: 'Code Documenter',
    description: 'Added helpful comments to explain your code',
    xp: 25,
    icon: '📚',
    lessonPath: '/learn/comments'
  },
  {
    id: 'syntax-explorer',
    title: 'Syntax Explorer',
    description: 'Tried different comment styles and fixed common mistakes',
    xp: 35,
    icon: '🔍',
    lessonPath: '/learn/comments'
  },
  // Variables achievements
  {
    id: 'variable-master',
    title: 'Variable Master',
    description: 'Created and used your first variable successfully',
    xp: 50,
    icon: '📦',
    lessonPath: '/lessons/full-course/programming-primer/variables'
  },
  {
    id: 'string-sage',
    title: 'String Sage',
    description: 'Successfully worked with text (string) variables',
    xp: 25,
    icon: '📝',
    lessonPath: '/lessons/full-course/programming-primer/variables'
  },
  {
    id: 'number-ninja',
    title: 'Number Ninja',
    description: 'Mastered working with numeric variables',
    xp: 25,
    icon: '🔢',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'boolean-boss',
    title: 'Boolean Boss',
    description: 'Used true/false values in your code',
    xp: 25,
    icon: '✅',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'array-ace',
    title: 'Array Ace',
    description: 'Created and used an array to store multiple values',
    xp: 35,
    icon: '📚',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'object-expert',
    title: 'Object Expert',
    description: 'Successfully created and used an object with properties',
    xp: 35,
    icon: '🎯',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'name-wizard',
    title: 'Name Wizard',
    description: 'Used clear, descriptive variable names',
    xp: 25,
    icon: '✨',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'value-changer',
    title: 'Value Changer',
    description: 'Updated variable values after creating them',
    xp: 30,
    icon: '🔄',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'null-navigator',
    title: 'Null Navigator',
    description: 'Worked with null and undefined values correctly',
    xp: 25,
    icon: '❓',
    lessonPath: '/lessons/variables'
  }
];

// Centralized achievements list
export const INTRODUCTION_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-program',
    title: 'First Program',
    description: 'Ran your first program successfully!',
    xp: 50,
    icon: '🚀',
    lessonPath: '/lessons/full-course/programming-primer/introduction'
  },
  {
    id: 'hello-coder',
    title: 'Hello, Coder!',
    description: 'Started your coding journey with your first program',
    xp: 25,
    icon: '👋',
    lessonPath: '/lessons/full-course/programming-primer/introduction'
  },
  {
    id: 'quick-learner',
    title: 'Quick Learner',
    description: 'Successfully ran code on your first try',
    xp: 25,
    icon: '⚡',
    lessonPath: '/lessons/introduction'
  },
  {
    id: 'code-explorer',
    title: 'Code Explorer',
    description: 'Modified and ran the example code 3 times',
    xp: 30,
    icon: '🔍',
    lessonPath: '/lessons/introduction'
  },
  {
    id: 'creative-coder',
    title: 'Creative Coder',
    description: 'Created a unique message using console.log',
    xp: 35,
    icon: '🎨',
    lessonPath: '/lessons/introduction'
  },
  {
    id: 'personalized-hello',
    title: 'Making It Personal',
    description: 'Personalized your Hello World message',
    xp: 20,
    icon: '✨',
    lessonPath: '/lessons/introduction'
  }
];

export const COMMENT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'comment-master',
    title: 'Comment Master',
    description: 'Successfully used both single-line and multi-line comments',
    xp: 30,
    icon: '📝',
    lessonPath: '/learn/comments'
  },
  {
    id: 'code-documenter',
    title: 'Code Documenter',
    description: 'Added helpful comments to explain your code',
    xp: 25,
    icon: '📚',
    lessonPath: '/learn/comments'
  },
  {
    id: 'syntax-explorer',
    title: 'Syntax Explorer',
    description: 'Tried different comment styles and fixed common mistakes',
    xp: 35,
    icon: '🔍',
    lessonPath: '/learn/comments'
  }
];

export const VARIABLES_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'variable-master',
    title: 'Variable Master',
    description: 'Created and used your first variable successfully',
    xp: 50,
    icon: '📦',
    lessonPath: '/lessons/full-course/programming-primer/variables'
  },
  {
    id: 'string-sage',
    title: 'String Sage',
    description: 'Successfully worked with text (string) variables',
    xp: 25,
    icon: '📝',
    lessonPath: '/lessons/full-course/programming-primer/variables'
  },
  {
    id: 'number-ninja',
    title: 'Number Ninja',
    description: 'Mastered working with numeric variables',
    xp: 25,
    icon: '🔢',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'boolean-boss',
    title: 'Boolean Boss',
    description: 'Used true/false values in your code',
    xp: 25,
    icon: '✅',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'array-ace',
    title: 'Array Ace',
    description: 'Created and used an array to store multiple values',
    xp: 35,
    icon: '📚',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'object-expert',
    title: 'Object Expert',
    description: 'Successfully created and used an object with properties',
    xp: 35,
    icon: '🎯',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'name-wizard',
    title: 'Name Wizard',
    description: 'Used clear, descriptive variable names',
    xp: 25,
    icon: '✨',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'value-changer',
    title: 'Value Changer',
    description: 'Updated variable values after creating them',
    xp: 30,
    icon: '🔄',
    lessonPath: '/lessons/variables'
  },
  {
    id: 'null-navigator',
    title: 'Null Navigator',
    description: 'Worked with null and undefined values correctly',
    xp: 25,
    icon: '❓',
    lessonPath: '/lessons/variables'
  }
];