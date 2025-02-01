import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';

interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function BaseButton({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: BaseButtonProps) {
  const { theme } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: {
      dark: {
        background: `bg-${themeConfig.colors.dark.primary.base} active:bg-${themeConfig.colors.dark.primary.active}`,
        text: `text-${themeConfig.colors.dark.primary.text} disabled:text-${themeConfig.colors.dark.text.muted}`,
        hover: `hover:bg-${themeConfig.colors.dark.primary.hover} disabled:hover:bg-${themeConfig.colors.dark.primary.base}`,
        focus: `focus:ring-${themeConfig.colors.dark.primary.focus} disabled:focus:ring-0`
      },
      neurodivergent: {
        background: `bg-${themeConfig.colors.neurodivergent.primary.base} active:bg-${themeConfig.colors.neurodivergent.primary.active}`,
        text: `text-${themeConfig.colors.neurodivergent.primary.text} disabled:text-${themeConfig.colors.neurodivergent.text.muted}`,
        hover: `hover:bg-${themeConfig.colors.neurodivergent.primary.hover} disabled:hover:bg-${themeConfig.colors.neurodivergent.primary.base}`,
        focus: `focus:ring-${themeConfig.colors.neurodivergent.primary.focus} disabled:focus:ring-0`
      },
      light: {
        background: `bg-${themeConfig.colors.light.primary.base} active:bg-${themeConfig.colors.light.primary.active}`,
        text: `text-${themeConfig.colors.light.primary.text} disabled:text-${themeConfig.colors.light.text.muted}`,
        hover: `hover:bg-${themeConfig.colors.light.primary.hover} disabled:hover:bg-${themeConfig.colors.light.primary.base}`,
        focus: `focus:ring-${themeConfig.colors.light.primary.focus} disabled:focus:ring-0`
      }
    },
    secondary: {
      dark: {
        background: `bg-${themeConfig.colors.dark.background.card}`,
        text: `text-${themeConfig.colors.dark.text.secondary}`,
        hover: `hover:bg-${themeConfig.colors.dark.background.hover}`,
        focus: `focus:ring-${themeConfig.colors.dark.border.focus}`
      },
      neurodivergent: {
        background: `bg-${themeConfig.colors.neurodivergent.background.card}`,
        text: `text-${themeConfig.colors.neurodivergent.text.primary}`,
        hover: `hover:bg-${themeConfig.colors.neurodivergent.background.hover}`,
        focus: `focus:ring-${themeConfig.colors.neurodivergent.border.focus}`
      },
      light: {
        background: `bg-${themeConfig.colors.light.background.card}`,
        text: `text-${themeConfig.colors.light.text.primary}`,
        hover: `hover:bg-${themeConfig.colors.light.background.hover}`,
        focus: `focus:ring-${themeConfig.colors.light.border.focus}`
      }
    },
    danger: {
      dark: {
        background: `bg-${themeConfig.colors.dark.background.error}`,
        text: `text-${themeConfig.colors.dark.text.error}`,
        hover: `hover:bg-${themeConfig.colors.dark.background.error}/80`,
        focus: `focus:ring-${themeConfig.colors.dark.border.error}`
      },
      neurodivergent: {
        background: `bg-${themeConfig.colors.neurodivergent.background.error}`,
        text: `text-${themeConfig.colors.neurodivergent.text.error}`,
        hover: `hover:bg-${themeConfig.colors.neurodivergent.background.error}/80`,
        focus: `focus:ring-${themeConfig.colors.neurodivergent.border.error}`
      },
      light: {
        background: `bg-${themeConfig.colors.light.background.error}`,
        text: `text-${themeConfig.colors.light.text.error}`,
        hover: `hover:bg-${themeConfig.colors.light.background.error}/80`,
        focus: `focus:ring-${themeConfig.colors.light.border.error}`
      }
    }
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';
  const loadingStyles = 'cursor-wait';

  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant][theme].background}
        ${variantStyles[variant][theme].text}
        ${variantStyles[variant][theme].hover}
        ${variantStyles[variant][theme].focus}
        ${sizeStyles[size]}
        ${disabled || isLoading ? disabledStyles : ''}
        ${isLoading ? loadingStyles : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}