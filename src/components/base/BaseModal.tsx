import { Dialog } from '@headlessui/react';
import { useTheme } from '../../contexts/ThemeContext';
import { themeConfig } from '../../config/theme';
import { BaseButton } from './BaseButton';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true
}: BaseModalProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl'
  };

  const themeStyles = {
    dark: {
      bg: `bg-${themeConfig.colors.dark.background.card}`,
      title: `text-${themeConfig.colors.dark.text.primary}`,
      content: `text-${themeConfig.colors.dark.text.secondary}`,
      overlay: `bg-${themeConfig.colors.dark.background.main}/80`,
      transition: 'transition-all duration-200'
    },
    neurodivergent: {
      bg: `bg-${themeConfig.colors.neurodivergent.background.card}`,
      title: `text-${themeConfig.colors.neurodivergent.text.primary}`,
      content: `text-${themeConfig.colors.neurodivergent.text.secondary}`,
      overlay: `bg-${themeConfig.colors.neurodivergent.background.main}/60`,
      transition: 'transition-all duration-300'
    },
    light: {
      bg: `bg-${themeConfig.colors.light.background.card}`,
      title: `text-${themeConfig.colors.light.text.primary}`,
      content: `text-${themeConfig.colors.light.text.secondary}`,
      overlay: `bg-${themeConfig.colors.light.background.main}/70`,
      transition: 'transition-all duration-200'
    }
  };

  const styles = themeStyles[theme];

  return (
    <Dialog
      as="div"
      className="relative z-50"
      open={isOpen}
      onClose={closeOnOverlayClick ? onClose : () => {}}
    >
      {/* Overlay */}
      <div className={`fixed inset-0 ${styles.transition} ${styles.overlay}`} />

      {/* Modal */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Dialog.Panel
            className={`
              relative transform overflow-hidden rounded-lg text-left shadow-xl
              transition-all sm:my-8 w-full ${sizeStyles[size]} ${styles.bg}
            `}
          >
            {/* Header */}
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <Dialog.Title
                as="h3"
                className={`text-lg font-medium leading-6 ${styles.title}`}
              >
                {title}
              </Dialog.Title>

              {/* Content */}
              <div className={`mt-3 ${styles.content}`}>
                {children}
              </div>
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                {footer}
              </div>
            )}

            {/* Default close button if no footer */}
            {!footer && (
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <BaseButton
                  variant="secondary"
                  onClick={onClose}
                >
                  Close
                </BaseButton>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}