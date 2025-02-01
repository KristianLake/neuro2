import { useTheme } from '../../../contexts/ThemeContext';
import { PurchaseCheck } from '../types/plans';

interface PriceDisplayProps {
  isUpgrade: boolean;
  price: string | number;
  purchaseCheck: PurchaseCheck | null;
  premiumFeatures?: string[];
}

export function PriceDisplay({ isUpgrade, price, purchaseCheck, premiumFeatures }: PriceDisplayProps) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-6 mb-6 ${
      theme === 'dark'
        ? 'bg-gray-700'
        : theme === 'neurodivergent'
        ? 'bg-amber-50'
        : 'bg-gray-50'
    }`}>
      {isUpgrade ? (
        <>
          <div className={`text-3xl font-bold mb-2 ${
            theme === 'dark'
              ? 'text-white'
              : 'text-gray-900'
          }`}>
            Upgrade to Premium: £{price}
          </div>
          <p className={`text-sm ${
            theme === 'dark'
              ? 'text-gray-300'
              : 'text-gray-600'
          }`}>
            Upgrade your Standard course to Premium and get:
          </p>
          {premiumFeatures && (
            <ul className={`mt-4 space-y-2 text-sm ${
              theme === 'dark'
                ? 'text-gray-300'
                : 'text-gray-600'
            }`}>
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className={`text-3xl font-bold mb-2 ${
          theme === 'dark'
            ? 'text-white'
            : 'text-gray-900'
        }`}>
          £{price}
        </div>
      )}
      {purchaseCheck?.discount > 0 && (
        <p className={`text-sm ${
          theme === 'dark'
            ? 'text-gray-300'
            : 'text-gray-600'
        }`}>
          Includes £{purchaseCheck.discount} discount for owned modules
        </p>
      )}
    </div>
  );
}