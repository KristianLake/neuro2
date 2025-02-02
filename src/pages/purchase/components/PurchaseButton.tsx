import { useTheme } from '../../../contexts/ThemeContext';

interface PurchaseButtonProps {
  loading: boolean;
  disabled: boolean;
  isUpgrade: boolean;
  onClick: () => void;
}

export function PurchaseButton({ loading, disabled, isUpgrade, onClick }: PurchaseButtonProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full rounded-md px-4 py-3 text-sm font-semibold shadow-sm ${
        theme === 'dark'
          ? 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-teal-600 text-white hover:bg-teal-500 disabled:bg-gray-400'
          : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-400'
      } disabled:cursor-not-allowed`}
    >
      {loading ? 'Processing...' : isUpgrade ? 'Upgrade Now' : 'Purchase Now'}
    </button>
  );
}