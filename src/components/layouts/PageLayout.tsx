import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = '' }: PageLayoutProps) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'dark'
        ? `bg-${themeConfig.colors.dark.background.main}`
        : theme === 'neurodivergent'
        ? `bg-${themeConfig.colors.neurodivergent.background.main}`
        : `bg-${themeConfig.colors.light.background.main}`
    }`}>
      <div className={`max-w-7xl mx-auto ${themeConfig.spacing.page.x} ${themeConfig.spacing.page.y} ${className}`}>
        {children}
      </div>
    </div>
  );
}