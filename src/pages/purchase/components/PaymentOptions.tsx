import { useTheme } from '../../../contexts/ThemeContext';
import { PaymentOption } from '../types/payments';

interface PaymentOptionsProps {
  selectedOption: PaymentOption;
  onSelectOption: (option: PaymentOption) => void;
}

export function PaymentOptions({ selectedOption, onSelectOption }: PaymentOptionsProps) {
  const { theme } = useTheme();

  return (
    <div className={`mb-6 rounded-lg p-4 ${
      theme === 'dark'
        ? 'bg-gray-700'
        : theme === 'neurodivergent'
        ? 'bg-amber-50'
        : 'bg-gray-50'
    }`}>
      <h3 className={`text-sm font-medium mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Payment Options</h3>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelectOption('full')}
          className={`p-3 rounded-lg text-sm font-medium ${
            selectedOption === 'full'
              ? theme === 'dark'
                ? 'bg-indigo-600 text-white'
                : theme === 'neurodivergent'
                ? 'bg-teal-600 text-white'
                : 'bg-indigo-600 text-white'
              : theme === 'dark'
              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              : theme === 'neurodivergent'
              ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          Pay in Full
        </button>
        <button
          onClick={() => onSelectOption(3)}
          className={`p-3 rounded-lg text-sm font-medium ${
            selectedOption === 3
              ? theme === 'dark'
                ? 'bg-indigo-600 text-white'
                : theme === 'neurodivergent'
                ? 'bg-teal-600 text-white'
                : 'bg-indigo-600 text-white'
              : theme === 'dark'
              ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              : theme === 'neurodivergent'
              ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
              : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
          }`}
        >
          3 Monthly Payments
        </button>
      </div>
    </div>
  );
}