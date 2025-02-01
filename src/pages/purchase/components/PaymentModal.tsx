import { useTheme } from '../../../contexts/ThemeContext';
import { PaymentStatus } from '../types/payments';
import { BaseModal, BaseButton } from '../../../components/base';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
  show: boolean;
  status: PaymentStatus;
  error: string | null;
  onClose: () => void;
}

export function PaymentModal({
  show,
  status,
  error,
  onClose
}: PaymentModalProps) {
  const { theme } = useTheme();

  const modalFooter = (
    <BaseButton
      variant="primary"
      onClick={onClose}
    >
      {status === 'success' ? 'View Course' : 'Close'}
    </BaseButton>
  );

  return (
    <BaseModal
      isOpen={show}
      onClose={onClose}
      title={
        status === 'success'
          ? 'Payment Successful'
          : status === 'failure'
          ? 'Payment Failed'
          : 'Processing Payment'
      }
      size="sm"
      footer={modalFooter}
    >
      <div className="sm:flex sm:items-start">
        {status === 'success' ? (
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
            <CheckCircleIcon className={`h-6 w-6 ${
              theme === 'dark'
                ? 'text-green-400'
                : theme === 'neurodivergent'
                ? 'text-teal-600'
                : 'text-green-600'
            }`} />
          </div>
        ) : status === 'failure' ? (
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
            <XCircleIcon className={`h-6 w-6 ${
              theme === 'dark'
                ? 'text-red-400'
                : theme === 'neurodivergent'
                ? 'text-red-600'
                : 'text-red-600'
            }`} />
          </div>
        ) : null}
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <div className="mt-2">
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>
              {status === 'success'
                ? 'Your purchase was successful! You now have access to the course content.'
                : status === 'failure'
                ? error || 'There was an error processing your payment. Please try again.'
                : 'Please wait while we process your payment...'}
            </p>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}