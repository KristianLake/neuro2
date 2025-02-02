import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';
import { XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface BaseAlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onDismiss?: () => void;
}

export function BaseAlert({ type, title, message, onDismiss }: BaseAlertProps) {
  const { theme } = useTheme();

  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };

  const Icon = icons[type];

  const getStyles = () => {
    switch (type) {
      case 'success':
        return theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.success}/20 border border-${themeConfig.colors.dark.border.success} text-${themeConfig.colors.dark.text.success}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.success} border border-${themeConfig.colors.neurodivergent.border.success} text-${themeConfig.colors.neurodivergent.text.success}`
          : `bg-${themeConfig.colors.light.background.success} border border-${themeConfig.colors.light.border.success} text-${themeConfig.colors.light.text.success}`;
      case 'error':
        return theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.error}/20 border border-${themeConfig.colors.dark.border.error} text-${themeConfig.colors.dark.text.error}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.error} border border-${themeConfig.colors.neurodivergent.border.error} text-${themeConfig.colors.neurodivergent.text.error}`
          : `bg-${themeConfig.colors.light.background.error} border border-${themeConfig.colors.light.border.error} text-${themeConfig.colors.light.text.error}`;
      case 'warning':
        return theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.warning}/20 border border-${themeConfig.colors.dark.border.warning} text-${themeConfig.colors.dark.text.warning}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.warning} border border-${themeConfig.colors.neurodivergent.border.warning} text-${themeConfig.colors.neurodivergent.text.warning}`
          : `bg-${themeConfig.colors.light.background.warning} border border-${themeConfig.colors.light.border.warning} text-${themeConfig.colors.light.text.warning}`;
      case 'info':
      default:
        return theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.info}/20 border border-${themeConfig.colors.dark.border.info} text-${themeConfig.colors.dark.text.info}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.info} border border-${themeConfig.colors.neurodivergent.border.info} text-${themeConfig.colors.neurodivergent.text.info}`
          : `bg-${themeConfig.colors.light.background.info} border border-${themeConfig.colors.light.border.info} text-${themeConfig.colors.light.text.info}`;
    }
  };

  return (
    <div className={`rounded-lg p-4 ${getStyles()}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Dismiss</span>
              <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}