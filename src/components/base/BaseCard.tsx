import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function BaseCard({
  children,
  className = '',
  variant = 'default',
  padding = 'md'
}: BaseCardProps) {
  const { theme } = useTheme();

  const baseStyles = 'rounded-lg transition-shadow';

  const variantStyles = {
    default: {
      dark: {
        background: `bg-${themeConfig.colors.dark.background.card}`
      },
      neurodivergent: {
        background: `bg-${themeConfig.colors.neurodivergent.background.card}`
      },
      light: {
        background: `bg-${themeConfig.colors.light.background.card}`
      }
    },
    elevated: {
      dark: {
        background: `bg-${themeConfig.colors.dark.background.card} shadow-lg`
      },
      neurodivergent: {
        background: `bg-${themeConfig.colors.neurodivergent.background.card} shadow-lg`
      },
      light: {
        background: `bg-${themeConfig.colors.light.background.card} shadow-lg`
      }
    },
    outlined: {
      dark: {
        background: `bg-${themeConfig.colors.dark.background.card} border border-${themeConfig.colors.dark.border.base}`
      },
      neurodivergent: {
        background: `bg-${themeConfig.colors.neurodivergent.background.card} border border-${themeConfig.colors.neurodivergent.border.base}`
      },
      light: {
        background: `bg-${themeConfig.colors.light.background.card} border border-${themeConfig.colors.light.border.base}`
      }
    }
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${variantStyles[variant][theme].background}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}