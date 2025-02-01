import { StandardPlan } from './StandardPlan';
import { PremiumPlan } from './PremiumPlan';
import { useTheme } from '../../../../contexts/ThemeContext';
import { PurchaseCheck } from '../../types/plans';

interface PlanSelectionProps {
  selectedPlan: 'standard' | 'premium';
  onSelectPlan: (plan: 'standard' | 'premium') => void;
  purchaseCheck: PurchaseCheck | null;
  isUpgrade: boolean;
  ownsStandardCourse: boolean;
}

export function PlanSelection({
  selectedPlan,
  onSelectPlan,
  purchaseCheck,
  isUpgrade,
  ownsStandardCourse
}: PlanSelectionProps) {
  const { theme } = useTheme();

  return (
    <div className="mb-6">
      <h2 className={`text-lg font-medium mb-4 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>Choose Your Plan</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <StandardPlan
          isSelected={selectedPlan === 'standard'}
          ownsStandard={ownsStandardCourse}
          onSelect={() => onSelectPlan('standard')}
        />
        <PremiumPlan
          isSelected={selectedPlan === 'premium'}
          isUpgrade={isUpgrade}
          ownsStandard={ownsStandardCourse}
          price={purchaseCheck?.finalPrice || 3997}
          onSelect={() => onSelectPlan('premium')}
        />
        {isUpgrade && (
          <div className={`col-span-2 mt-4 p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-green-900/20 border border-green-800'
              : theme === 'neurodivergent'
              ? 'bg-teal-50 border border-teal-200'
              : 'bg-green-50 border border-green-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              theme === 'dark'
                ? 'text-green-400'
                : theme === 'neurodivergent'
                ? 'text-teal-800'
                : 'text-green-800'
            }`}>Upgrade to Premium</h4>
            <p className={`text-sm ${
              theme === 'dark'
                ? 'text-green-300'
                : theme === 'neurodivergent'
                ? 'text-teal-700'
                : 'text-green-700'
            }`}>
              You'll be charged £{purchaseCheck?.finalPrice} to upgrade from Standard to Premium.
              This gives you access to all Premium features including 1:1 coaching, priority support,
              and career guidance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}