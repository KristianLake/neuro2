import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function BaseInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: BaseInputProps) {
  const { theme } = useTheme();

  const baseStyles = 'block w-full rounded-md shadow-sm focus:outline-none sm:text-sm';

  const themeStyles = {
    dark: {
      input: `bg-${themeConfig.colors.dark.background.input} text-${themeConfig.colors.dark.text.primary} border-${themeConfig.colors.dark.border.base} focus:border-${themeConfig.colors.dark.primary.base} focus:ring-${themeConfig.colors.dark.primary.focus}`,
      label: `text-${themeConfig.colors.dark.text.secondary}`,
      helper: `text-${themeConfig.colors.dark.text.muted}`,
      error: 'text-red-400',
      disabled: `bg-${themeConfig.colors.dark.background.card} text-${themeConfig.colors.dark.text.muted}`
    },
    neurodivergent: {
      input: `bg-${themeConfig.colors.neurodivergent.background.input} text-${themeConfig.colors.neurodivergent.text.primary} border-${themeConfig.colors.neurodivergent.border.base} focus:border-${themeConfig.colors.neurodivergent.primary.base} focus:ring-${themeConfig.colors.neurodivergent.primary.focus}`,
      label: `text-${themeConfig.colors.neurodivergent.text.primary}`,
      helper: `text-${themeConfig.colors.neurodivergent.text.secondary}`,
      error: 'text-red-600',
      disabled: `bg-${themeConfig.colors.neurodivergent.background.card} text-${themeConfig.colors.neurodivergent.text.muted}`
    },
    light: {
      input: `bg-${themeConfig.colors.light.background.input} text-${themeConfig.colors.light.text.primary} border-${themeConfig.colors.light.border.base} focus:border-${themeConfig.colors.light.primary.base} focus:ring-${themeConfig.colors.light.primary.focus}`,
      label: `text-${themeConfig.colors.light.text.secondary}`,
      helper: `text-${themeConfig.colors.light.text.muted}`,
      error: 'text-red-600',
      disabled: `bg-${themeConfig.colors.light.background.card} text-${themeConfig.colors.light.text.muted}`
    }
  };

  const styles = themeStyles[theme];

  return (
    <div>
      {label && (
        <label className={`block text-sm font-medium mb-1 ${styles.label}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            ${baseStyles}
            ${styles.input}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${disabled ? styles.disabled : ''}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? styles.error : styles.helper}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}