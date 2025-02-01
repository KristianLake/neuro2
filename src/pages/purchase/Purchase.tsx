import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { PRICING } from './utils/pricing';
import { usePurchaseFlow } from './hooks/usePurchaseFlow';
import { PaymentOption } from './types/payments';

// Components
import { PlanSelection } from './components/PlanSelection';
import { PurchaseHeader } from './components/PurchaseHeader';
import { PriceDisplay } from './components/PriceDisplay';
import { PaymentOptions } from './components/PaymentOptions';
import { PurchaseButton } from './components/PurchaseButton';
import { PaymentModal } from './components/PaymentModal';
import { ErrorDisplay } from './components/ErrorDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';

export default function Purchase() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isFullCourse = moduleId === 'full-course';
  const module = !isFullCourse ? PRICING.modules[moduleId as keyof typeof PRICING.modules] : null;
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard');
  const fullCourse = isFullCourse ? PRICING.fullProgram[selectedPlan] : null;
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');

  const {
    state,
    loading,
    handlePurchase,
    closePaymentModal,
    ownsStandardCourse,
    isUpgrade
  } = usePurchaseFlow({ moduleId, selectedPlan });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location]);

  useEffect(() => {
    if (!isFullCourse && !module) {
      navigate('/courses');
    }
  }, [moduleId, navigate, module]);

  if (!isFullCourse && !module) {
    return null;
  }

  if (!state.showContent) {
    return <LoadingSpinner />;
  }

  const getPrice = () => {
    if (state.purchaseCheck) {
      if (state.purchaseCheck.discount > 0) {
        return `${state.purchaseCheck.finalPrice} (£${state.purchaseCheck.discount} discount applied)`;
      }
      return state.purchaseCheck.finalPrice;
    }
    if (isFullCourse) {
      if (paymentOption === 'full') {
        return fullCourse!.price;
      }
      const plan = selectedPlan === 'premium' ? PRICING.fullProgram.premium : PRICING.fullProgram.standard;
      const option = plan.monthlyOptions.find(opt => opt.months === paymentOption);
      return option ? `${option.amount}/month for ${paymentOption} months` : fullCourse!.price;
    }
    return module!.price;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Error/Status Messages */}
        {ownsStandardCourse && (
          <ErrorDisplay
            type="owned"
            message="You already own the Standard course. Consider upgrading to Premium to get additional features and support."
          />
        )}
        {state.loadingError && (
          <ErrorDisplay
            type="loading"
            message={state.loadingError}
          />
        )}

        {/* Main Purchase Card */}
        <div className={`rounded-lg shadow-lg overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <PurchaseHeader
            isFullCourse={isFullCourse}
            module={module}
            fullCourse={fullCourse}
          />

          <div className="p-6">
            {/* Plan Selection */}
            {isFullCourse && (
              <PlanSelection
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
                purchaseCheck={state.purchaseCheck}
                isUpgrade={isUpgrade}
                ownsStandardCourse={ownsStandardCourse}
              />
            )}

            {/* Price Display */}
            <PriceDisplay
              isUpgrade={isUpgrade}
              price={getPrice()}
              purchaseCheck={state.purchaseCheck}
              premiumFeatures={PRICING.fullProgram.premium.features}
            />
            
            {/* Payment Options */}
            {isFullCourse && (
              <PaymentOptions
                selectedOption={paymentOption}
                onSelectOption={setPaymentOption}
              />
            )}

            {/* Purchase Button */}
            <PurchaseButton
              loading={loading}
              disabled={!state.purchaseCheck?.allowed}
              isUpgrade={isUpgrade}
              onClick={handlePurchase}
            />

            {/* Purchase Error */}
            {state.purchaseError && (
              <ErrorDisplay
                type="purchase"
                message={state.purchaseError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        show={state.showPaymentModal}
        status={state.paymentStatus}
        error={state.purchaseError}
        onClose={closePaymentModal}
      />
    </div>
  );
}