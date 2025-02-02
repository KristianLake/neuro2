import { PricingConfig } from '../types/plans';

export const PRICING: PricingConfig = {
  fullProgram: {
    standard: {
      name: "90-Day Web Developer Program",
      price: 2497,
      monthlyOptions: [
        { months: 3, amount: 899 },
        { months: 6, amount: 449 },
        { months: 12, amount: 225 }
      ],
      features: [
        "Complete course access",
        "Group Q&A sessions",
        "Discord community",
        "Project feedback"
      ]
    },
    premium: {
      name: "90-Day Web Developer Program (Premium)",
      price: 3997,
      monthlyOptions: [
        { months: 3, amount: 1399 },
        { months: 6, amount: 699 },
        { months: 12, amount: 349 }
      ],
      features: [
        "1:1 coaching sessions",
        "Priority support",
        "Career guidance",
        "Portfolio reviews",
        "Mock interviews",
        "LinkedIn optimization"
      ]
    }
  },
  modules: {
    'module-1': {
      name: 'Programming Primer',
      price: 197,
      description: 'Foundation module focusing on programming basics with a neurodivergent-friendly approach.'
    },
    'module-2': {
      name: 'TypeScript Navigator',
      price: 247,
      description: 'Introduction to TypeScript fundamentals and setup.'
    },
    'module-3': {
      name: 'Syntax Sculptor',
      price: 297,
      description: 'Advanced TypeScript syntax and patterns.'
    },
    'module-4': {
      name: 'React Catalyst',
      price: 347,
      description: 'Introduction to React fundamentals.'
    },
    'module-5': {
      name: 'TypeScript Fusion',
      price: 397,
      description: 'Master the integration of TypeScript with React.'
    },
    'module-6': {
      name: 'State Sorcerer',
      price: 447,
      description: 'Advanced state management in React.'
    },
    'module-7': {
      name: 'Project Architect',
      price: 497,
      description: 'Building production-ready applications.'
    },
    'module-8': {
      name: 'API Alchemist',
      price: 547,
      description: 'API integration and data management.'
    },
    'module-9': {
      name: 'Career Blueprint',
      price: 597,
      description: 'Portfolio development and career preparation.'
    }
  }
};