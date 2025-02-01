export const themeConfig = {
  colors: {
    light: {
      primary: {
        base: 'indigo-600',
        hover: 'indigo-700',
        text: 'white',
        focus: 'indigo-500',
        active: 'indigo-800'
      },
      background: {
        main: 'white',
        card: 'white',
        input: 'white',
        hover: 'gray-50',
        active: 'gray-100',
        success: 'green-50',
        error: 'red-50',
        warning: 'yellow-50',
        info: 'blue-50'
      },
      text: {
        primary: 'gray-900',
        secondary: 'gray-600',
        muted: 'gray-400',
        inverse: 'white',
        success: 'green-800',
        error: 'red-800',
        warning: 'yellow-800',
        info: 'blue-800'
      },
      border: {
        base: 'gray-200',
        focus: 'indigo-500',
        hover: 'gray-300',
        success: 'green-200',
        error: 'red-200',
        warning: 'yellow-200',
        info: 'blue-200'
      }
    },
    dark: {
      primary: {
        base: 'indigo-500',
        hover: 'indigo-400',
        text: 'white',
        focus: 'indigo-400',
        active: 'indigo-600'
      },
      background: {
        main: 'gray-900',
        card: 'gray-800',
        input: 'gray-700',
        hover: 'gray-700',
        active: 'gray-600',
        success: 'green-900',
        error: 'red-900',
        warning: 'yellow-900',
        info: 'blue-900'
      },
      text: {
        primary: 'white',
        secondary: 'gray-300',
        muted: 'gray-400',
        inverse: 'gray-900',
        success: 'green-400',
        error: 'red-400',
        warning: 'yellow-400',
        info: 'blue-400'
      },
      border: {
        base: 'gray-700',
        focus: 'indigo-400',
        hover: 'gray-600',
        success: 'green-800',
        error: 'red-800',
        warning: 'yellow-800',
        info: 'blue-800'
      }
    },
    neurodivergent: {
      primary: {
        base: 'teal-600',
        hover: 'teal-500',
        text: 'white',
        focus: 'teal-600',
        active: 'teal-700'
      },
      background: {
        main: 'amber-50',
        card: 'amber-100/50',
        input: 'amber-50',
        hover: 'amber-100',
        active: 'amber-200',
        success: 'teal-50',
        error: 'red-50',
        warning: 'amber-50',
        info: 'blue-50'
      },
      text: {
        primary: 'gray-900',
        secondary: 'gray-600',
        muted: 'gray-500',
        inverse: 'white',
        success: 'teal-800',
        error: 'red-800',
        warning: 'amber-800',
        info: 'blue-800'
      },
      border: {
        base: 'amber-200',
        focus: 'teal-600',
        hover: 'amber-300',
        success: 'teal-200',
        error: 'red-200',
        warning: 'amber-200',
        info: 'blue-200'
      }
    }
  },
  spacing: {
    page: {
      x: 'px-4 sm:px-6 lg:px-8',
      y: 'py-12'
    },
    section: {
      x: 'px-4 sm:px-6',
      y: 'py-6'
    },
    card: {
      x: 'px-4 sm:px-6',
      y: 'py-4'
    }
  },
  typography: {
    heading: {
      h1: 'text-3xl font-bold',
      h2: 'text-2xl font-bold',
      h3: 'text-xl font-semibold',
      h4: 'text-lg font-semibold'
    },
    body: {
      base: 'text-base',
      sm: 'text-sm',
      xs: 'text-xs'
    }
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};

export type ThemeConfig = typeof themeConfig;