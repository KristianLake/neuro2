import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { BaseModal, BaseButton } from './base';

interface PurchaseModalProps {
  show: boolean;
  onClose: () => void;
  moduleId: string;
  moduleName: string;
  price: number;
}

export default function PurchaseModal({ show, onClose, moduleId, moduleName, price }: PurchaseModalProps) {
  const { theme } = useTheme();

  const modalFooter = (
    <div className="space-y-4">
      <Link
        to={`/purchase/${moduleId}`}
        className={`block w-full rounded-md px-4 py-3 text-sm font-semibold text-white shadow-sm ${
          theme === 'dark'
            ? 'bg-indigo-600 hover:bg-indigo-500'
            : theme === 'neurodivergent'
            ? 'bg-teal-600 hover:bg-teal-500'
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        Purchase Now
      </Link>
      
      <BaseButton
        variant="secondary"
        onClick={onClose}
        className="w-full"
      >
        Maybe Later
      </BaseButton>
    </div>
  );

  return (
    <BaseModal
      isOpen={show}
      onClose={onClose}
      title="Premium Content"
      size="lg"
      footer={modalFooter}
    >
      <div className="text-center">
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-4 ${
          theme === 'dark'
            ? 'bg-indigo-900/20'
            : theme === 'neurodivergent'
            ? 'bg-teal-50'
            : 'bg-indigo-50'
        }`}>
          <span className="text-4xl">🔒</span>
        </div>

        <p className={`text-lg mb-6 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {moduleName} is part of our premium course content.
        </p>

        <div className={`rounded-lg p-6 mb-6 ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50'
            : 'bg-gray-50'
        }`}>
          <div className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            £{price}
          </div>
          <div className={`text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            One-time payment for full access
          </div>
        </div>
      </div>
    </BaseModal>
  );
}