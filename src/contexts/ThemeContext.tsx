import { createContext, useContext, useEffect, useState } from 'react';

// Export the context type
export type ThemeMode = 'light' | 'dark' | 'neurodivergent';
export type FontMode = 'system' | 'dyslexic';
export type LineSpacingMode = 'normal' | 'relaxed' | 'loose';
export type ReadingGuideMode = 'off' | 'line' | 'paragraph';

export interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  font: FontMode;
  setFont: (font: FontMode) => void;
  lineSpacing: LineSpacingMode;
  setLineSpacing: (spacing: LineSpacingMode) => void;
  readingGuide: ReadingGuideMode;
  setReadingGuide: (guide: ReadingGuideMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

import { themeConfig } from '../config/theme';

export const predefinedThemes = {
  light: {
    background: `bg-${themeConfig.colors.light.background.main}`,
    text: `text-${themeConfig.colors.light.text.primary}`,
    border: `border-${themeConfig.colors.light.border.base}`,
    primary: `bg-${themeConfig.colors.light.primary.base}`,
    primaryHover: `hover:bg-${themeConfig.colors.light.primary.hover}`,
    secondary: `bg-${themeConfig.colors.light.background.hover}`,
    secondaryHover: `hover:bg-${themeConfig.colors.light.background.active}`,
  },
  dark: {
    background: `bg-${themeConfig.colors.dark.background.main}`,
    text: `text-${themeConfig.colors.dark.text.primary}`,
    border: `border-${themeConfig.colors.dark.border.base}`,
    primary: `bg-${themeConfig.colors.dark.primary.base}`,
    primaryHover: `hover:bg-${themeConfig.colors.dark.primary.hover}`,
    secondary: `bg-${themeConfig.colors.dark.background.hover}`,
    secondaryHover: `hover:bg-${themeConfig.colors.dark.background.active}`,
  },
  neurodivergent: {
    background: `bg-${themeConfig.colors.neurodivergent.background.main}`,
    text: `text-${themeConfig.colors.neurodivergent.text.primary}`,
    border: `border-${themeConfig.colors.neurodivergent.border.base}`,
    primary: `bg-${themeConfig.colors.neurodivergent.primary.base}`,
    primaryHover: `hover:bg-${themeConfig.colors.neurodivergent.primary.hover}`,
    secondary: `bg-${themeConfig.colors.neurodivergent.background.hover}`,
    secondaryHover: `hover:bg-${themeConfig.colors.neurodivergent.background.active}`,
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    return savedTheme || 'light';
  });

  const [font, setFont] = useState<FontMode>(() => {
    const savedFont = localStorage.getItem('font') as FontMode;
    return savedFont || 'system';
  });

  const [lineSpacing, setLineSpacing] = useState<LineSpacingMode>(() => {
    const savedSpacing = localStorage.getItem('lineSpacing') as LineSpacingMode;
    return savedSpacing || 'normal';
  });

  const [readingGuide, setReadingGuide] = useState<ReadingGuideMode>(() => {
    const savedGuide = localStorage.getItem('readingGuide') as ReadingGuideMode;
    return savedGuide || 'off';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Update root element classes
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-neurodivergent');
    root.classList.add(`theme-${theme}`);
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#111827' : theme === 'neurodivergent' ? '#fffbeb' : '#ffffff'
      );
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('font', font);
    const root = document.documentElement;
    root.classList.remove('font-dyslexic');
    if (font === 'dyslexic') {
      root.classList.add('font-dyslexic');
    }
  }, [font]);

  useEffect(() => {
    localStorage.setItem('lineSpacing', lineSpacing);
    const root = document.documentElement;
    root.classList.remove('spacing-normal', 'spacing-relaxed', 'spacing-loose');
    root.classList.add(`spacing-${lineSpacing}`);
  }, [lineSpacing]);

  useEffect(() => {
    localStorage.setItem('readingGuide', readingGuide);
    const root = document.documentElement;
    root.classList.remove('guide-off', 'guide-line', 'guide-paragraph');
    root.classList.add(`guide-${readingGuide}`);
  }, [readingGuide]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont, lineSpacing, setLineSpacing, readingGuide, setReadingGuide }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}