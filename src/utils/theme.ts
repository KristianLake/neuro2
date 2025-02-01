import { ThemeMode } from '../contexts/ThemeContext';
import { themeConfig } from '../config/theme';

interface ThemeStyles {
  background: string;
  text: string;
  border: string;
  hover?: string;
  focus?: string;
}

export const getThemeStyles = (theme: ThemeMode, styles: {
  light: ThemeStyles;
  dark: ThemeStyles;
  neurodivergent: ThemeStyles;
}): ThemeStyles => {
  return styles[theme];
};

export const commonThemeStyles = {
  card: (theme: ThemeMode) => getThemeStyles(theme, {
    light: {
      background: `bg-${themeConfig.colors.light.background.card}`,
      text: `text-${themeConfig.colors.light.text.primary}`,
      border: `border-${themeConfig.colors.light.border.base}`
    },
    dark: {
      background: `bg-${themeConfig.colors.dark.background.card}`,
      text: `text-${themeConfig.colors.dark.text.primary}`,
      border: `border-${themeConfig.colors.dark.border.base}`
    },
    neurodivergent: {
      background: `bg-${themeConfig.colors.neurodivergent.background.card}`,
      text: `text-${themeConfig.colors.neurodivergent.text.primary}`,
      border: `border-${themeConfig.colors.neurodivergent.border.base}`
    }
  }),
  button: (theme: ThemeMode) => getThemeStyles(theme, {
    light: {
      background: `bg-${themeConfig.colors.light.primary.base}`,
      text: `text-${themeConfig.colors.light.primary.text}`,
      hover: `hover:bg-${themeConfig.colors.light.primary.hover}`,
      focus: `focus:ring-${themeConfig.colors.light.primary.focus}`,
      border: 'border-transparent'
    },
    dark: {
      background: `bg-${themeConfig.colors.dark.primary.base}`,
      text: `text-${themeConfig.colors.dark.primary.text}`,
      hover: `hover:bg-${themeConfig.colors.dark.primary.hover}`,
      focus: `focus:ring-${themeConfig.colors.dark.primary.focus}`,
      border: 'border-transparent'
    },
    neurodivergent: {
      background: `bg-${themeConfig.colors.neurodivergent.primary.base}`,
      text: `text-${themeConfig.colors.neurodivergent.primary.text}`,
      hover: `hover:bg-${themeConfig.colors.neurodivergent.primary.hover}`,
      focus: `focus:ring-${themeConfig.colors.neurodivergent.primary.focus}`,
      border: 'border-transparent'
    }
  }),
  nav: (theme: ThemeMode, isActive: boolean) => getThemeStyles(theme, {
    light: {
      background: isActive ? `bg-${themeConfig.colors.light.primary.base}` : 'bg-transparent',
      text: isActive ? `text-${themeConfig.colors.light.primary.text}` : `text-${themeConfig.colors.light.text.secondary}`,
      hover: `hover:bg-${themeConfig.colors.light.background.hover} hover:text-${themeConfig.colors.light.text.primary}`,
      border: 'border-transparent'
    },
    dark: {
      background: isActive ? `bg-${themeConfig.colors.dark.primary.base}` : 'bg-transparent',
      text: isActive ? `text-${themeConfig.colors.dark.primary.text}` : `text-${themeConfig.colors.dark.text.secondary}`,
      hover: `hover:bg-${themeConfig.colors.dark.background.hover} hover:text-${themeConfig.colors.dark.text.primary}`,
      border: 'border-transparent'
    },
    neurodivergent: {
      background: isActive ? `bg-${themeConfig.colors.neurodivergent.primary.base}` : 'bg-transparent',
      text: isActive ? `text-${themeConfig.colors.neurodivergent.primary.text}` : `text-${themeConfig.colors.neurodivergent.text.secondary}`,
      hover: `hover:bg-${themeConfig.colors.neurodivergent.background.hover} hover:text-${themeConfig.colors.neurodivergent.text.primary}`,
      border: 'border-transparent'
    }
  })
};