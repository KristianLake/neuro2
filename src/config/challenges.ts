import { Achievement } from '../types/achievements';

interface Challenge {
  title: string;
  description: string[];
  example: string;
}

export const challengeInfo: Record<Achievement['id'], Challenge> = {
  // Introduction Achievements
  'first-program': {
    title: 'Write Your First Program',
    description: [
      'Use console.log() to print a message',
      'Make sure to use quotes around your text',
      'Click "Run Code" to see the result'
    ],
    example: 'console.log("Hello, World!");'
  },
  'hello-coder': {
    title: 'Say Hello',
    description: [
      'Create a greeting message',
      'Use console.log() with your own text',
      'Try making it personal!'
    ],
    example: 'console.log("Hello from Alex!");'
  },
  'quick-learner': {
    title: 'Perfect First Try',
    description: [
      'Write a program that runs correctly on your first attempt',
      'Pay attention to syntax details',
      'Double-check your code before running'
    ],
    example: 'console.log("I got it right!");'
  },
  'code-explorer': {
    title: 'Explore Different Messages',
    description: [
      'Try printing different types of messages',
      'Experiment with various text content',
      'Run your code multiple times with changes'
    ],
    example: 'console.log("Message 1");\nconsole.log("Message 2");'
  },
  'creative-coder': {
    title: 'Get Creative',
    description: [
      'Write a unique message',
      'Make it different from the examples',
      'Express yourself through code'
    ],
    example: 'console.log("My unique message here!");'
  },
  'personalized-hello': {
    title: 'Make It Personal',
    description: [
      'Modify the Hello World program',
      'Add your own personal touch',
      'Make it unique to you'
    ],
    example: 'console.log("Hello from YOUR_NAME!");'
  },

  // Variables Achievements
  'variable-master': {
    title: 'Create Your First Variable',
    description: [
      'Declare a variable using let',
      'Give it a meaningful name',
      'Assign it a value'
    ],
    example: 'let myName = "Alex";\nconsole.log(myName);'
  },
  'string-sage': {
    title: 'Work with Text Variables',
    description: [
      'Create a variable holding text',
      'Use quotes around the text value',
      'Print the variable'
    ],
    example: 'let message = "Hello!";\nconsole.log(message);'
  },
  'number-ninja': {
    title: 'Store Numbers',
    description: [
      'Create a variable with a number',
      'No quotes needed for numbers',
      'Try using it in a calculation'
    ],
    example: 'let age = 25;\nconsole.log("Age:", age);'
  },
  'boolean-boss': {
    title: 'Use True/False Values',
    description: [
      'Create a boolean variable',
      'Use true or false as the value',
      'Print the result'
    ],
    example: 'let isStudent = true;\nconsole.log("Is student:", isStudent);'
  },
  'array-ace': {
    title: 'Create a List',
    description: [
      'Make an array of values',
      'Use square brackets []',
      'Add multiple items'
    ],
    example: 'let colors = ["red", "blue", "green"];\nconsole.log(colors);'
  },
  'object-expert': {
    title: 'Build an Object',
    description: [
      'Create an object with properties',
      'Use curly braces {}',
      'Add multiple key-value pairs'
    ],
    example: 'let person = {\n  name: "Alex",\n  age: 25\n};\nconsole.log(person);'
  },
  'name-wizard': {
    title: 'Use Clear Names',
    description: [
      'Create variables with descriptive names',
      'Use camelCase naming',
      'Make the purpose clear'
    ],
    example: 'let firstName = "Alex";\nlet userAge = 25;\nconsole.log(firstName, userAge);'
  },
  'value-changer': {
    title: 'Change Variable Values',
    description: [
      'Create a variable',
      'Change its value',
      'Print both values'
    ],
    example: 'let count = 1;\nconsole.log(count);\ncount = 2;\nconsole.log(count);'
  },
  'null-navigator': {
    title: 'Handle Empty Values',
    description: [
      'Create a variable with no value',
      'Use null or undefined',
      'Check the value'
    ],
    example: 'let emptyBox = null;\nconsole.log("Empty:", emptyBox);'
  }
};