import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';

interface BaseSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export function BaseSelect({
  label,
  error,
  helperText,
  options,
  className = '',
  disabled,
  ...props
}: BaseSelectProps) {
  const { theme } = useTheme();

  const baseStyles = 'block w-full rounded-md shadow-sm focus:outline-none sm:text-sm';

  const themeStyles = {
    dark: {
      select: `bg-${themeConfig.colors.dark.background.input} text-${themeConfig.colors.dark.text.primary} border-${themeConfig.colors.dark.border.base} focus:border-${themeConfig.colors.dark.primary.base} focus:ring-${themeConfig.colors.dark.primary.focus}`,
      label: `text-${themeConfig.colors.dark.text.secondary}`,
      helper: `text-${themeConfig.colors.dark.text.muted}`,
      error: `text-${themeConfig.colors.dark.text.error}`,
      disabled: `bg-${themeConfig.colors.dark.background.card} text-${themeConfig.colors.dark.text.muted}`
    },
    neurodivergent: {
      select: `bg-${themeConfig.colors.neurodivergent.background.input} text-${themeConfig.colors.neurodivergent.text.primary} border-${themeConfig.colors.neurodivergent.border.base} focus:border-${themeConfig.colors.neurodivergent.primary.base} focus:ring-${themeConfig.colors.neurodivergent.primary.focus}`,
      label: `text-${themeConfig.colors.neurodivergent.text.primary}`,
      helper: `text-${themeConfig.colors.neurodivergent.text.secondary}`,
      error: `text-${themeConfig.colors.neurodivergent.text.error}`,
      disabled: `bg-${themeConfig.colors.neurodivergent.background.card} text-${themeConfig.colors.neurodivergent.text.muted}`
    },
    light: {
      select: `bg-${themeConfig.colors.light.background.input} text-${themeConfig.colors.light.text.primary} border-${themeConfig.colors.light.border.base} focus:border-${themeConfig.colors.light.primary.base} focus:ring-${themeConfig.colors.light.primary.focus}`,
      label: `text-${themeConfig.colors.light.text.secondary}`,
      helper: `text-${themeConfig.colors.light.text.muted}`,
      error: `text-${themeConfig.colors.light.text.error}`,
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
      <select
        className={`
          ${baseStyles}
          ${styles.select}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${disabled ? styles.disabled : ''}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? styles.error : styles.helper}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}