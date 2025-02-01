import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { commonThemeStyles } from '../utils/theme';

export function useThemeStyles() {
  const { theme } = useTheme();
  
  return useMemo(() => ({
    card: commonThemeStyles.card(theme),
    button: commonThemeStyles.button(theme),
    nav: (isActive: boolean) => commonThemeStyles.nav(theme, isActive),
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
    },
    border: theme === 'dark'
      ? 'border-gray-700'
      : theme === 'neurodivergent'
      ? 'border-amber-200'
      : 'border-gray-200'
  }), [theme]);
}