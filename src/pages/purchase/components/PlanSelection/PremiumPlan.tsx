import { useTheme } from '../../../../contexts/ThemeContext';
import { PRICING } from '../../utils/pricing';

interface PremiumPlanProps {
  isSelected: boolean;
  isUpgrade: boolean;
  ownsStandard: boolean;
  price: number;
  onSelect: () => void;
}

export function PremiumPlan({
  isSelected,
  isUpgrade,
  ownsStandard,
  price,
  onSelect
}: PremiumPlanProps) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-6 ${
      theme === 'dark'
        ? 'bg-indigo-900/20 border-2 border-indigo-500'
        : theme === 'neurodivergent'
        ? 'bg-teal-50 border-2 border-teal-600'
        : 'bg-indigo-50 border-2 border-indigo-500'
    }`}>
      <h3 className={`text-xl font-bold mb-2 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Premium</h3>
      <div className={`text-2xl font-bold mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {ownsStandard
          ? isUpgrade
            ? `Upgrade for £${price}`
            : 'Already Purchased'
          : '£3,997'
        }
      </div>
      {ownsStandard && (
        <p className={`text-sm mb-4 ${
          theme === 'dark'
            ? 'text-gray-400'
            : theme === 'neurodivergent'
            ? 'text-teal-700'
            : 'text-gray-600'
        }`}>
          Upgrade from Standard to Premium and get additional features
        </p>
      )}
      <ul className={`space-y-2 mb-6 ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <li className="flex items-center">
          <span className="mr-2">✓</span>
          Everything in Standard
        </li>
        {PRICING.fullProgram.premium.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <span className="mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        disabled={ownsStandard && !isUpgrade}
        className={`w-full rounded-md px-4 py-2 text-sm font-medium ${
          ownsStandard && !isUpgrade
            ? theme === 'dark'
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : theme === 'neurodivergent'
              ? 'bg-amber-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            :
          theme === 'dark'
            ? isSelected
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-600 text-white hover:bg-gray-500'
            : theme === 'neurodivergent'
            ? isSelected
              ? 'bg-teal-600 text-white'
              : 'bg-amber-200 text-gray-900 hover:bg-amber-300'
            : isSelected
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
        }`}
      >
        {isSelected ? 'Selected' : isUpgrade ? 'Select Upgrade' : 'Select Premium'}
      </button>
    </div>
  );
}