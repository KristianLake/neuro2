import { useState, useEffect } from 'react';
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
  const { courseId } = useParams<{ courseId: string }>();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation(); // use pathname only
  const { user } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard');
  const isFullCourse = pathname.startsWith('/purchase/course/');
  const isMasterclass = pathname.startsWith('/purchase/master/');
  const isMiniCourse = pathname.startsWith('/purchase/mini/');
  const fullCourse = isFullCourse ? PRICING.fullProgram[selectedPlan] : null;
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');

  // Always call the hook unconditionally.
  const {
    state,
    loading,
    handlePurchase,
    closePaymentModal,
    ownsStandardCourse,
    isUpgrade
  } = usePurchaseFlow({ moduleId: courseId, selectedPlan });

  // Redirect to login if not authenticated.
  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { state: { from: pathname } });
    }
  }, [user, navigate, pathname]);

  // If no courseId is provided, render an error message.
  if (!courseId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorDisplay type="error" message="No course selected." />
      </div>
    );
  }

  // Show a spinner if the purchase flow isn’t ready.
  if (!state.showContent) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
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
        <div className={`rounded-lg shadow-lg overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <PurchaseHeader
            isFullCourse={isFullCourse}
            isMasterclass={isMasterclass}
            isMiniCourse={isMiniCourse}
            courseId={courseId}
            fullCourse={fullCourse}
          />
          <div className="p-6">
            {isFullCourse && (
              <PlanSelection
                selectedPlan={selectedPlan}
                onSelectPlan={setSelectedPlan}
                purchaseCheck={state.purchaseCheck}
                isUpgrade={isUpgrade}
                ownsStandardCourse={ownsStandardCourse}
              />
            )}
            <PriceDisplay
              isUpgrade={isUpgrade}
              price={state.purchaseCheck?.finalPrice || (isFullCourse ? fullCourse?.price : 0)}
              purchaseCheck={state.purchaseCheck}
              premiumFeatures={PRICING.fullProgram.premium.features}
            />
            {isFullCourse && (
              <PaymentOptions
                selectedOption={paymentOption}
                onSelectOption={setPaymentOption}
              />
            )}
            <PurchaseButton
              loading={loading}
              disabled={!state.purchaseCheck?.allowed}
              isUpgrade={isUpgrade}
              onClick={handlePurchase}
            />
            {state.purchaseError && (
              <ErrorDisplay
                type="purchase"
                message={state.purchaseError}
              />
            )}
          </div>
        </div>
      </div>
      <PaymentModal
        show={state.showPaymentModal}
        status={state.paymentStatus}
        error={state.purchaseError}
        onClose={closePaymentModal}
      />
    </div>
  );
}
