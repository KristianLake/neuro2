import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePurchases } from '../../../hooks/usePurchases';
import { usePayment } from '../../../hooks/usePayment';
import { PurchaseCheck } from '../types/plans';
import { PaymentStatus } from '../types/payments';

interface UsePurchaseFlowProps {
  moduleId: string | undefined;
  selectedPlan: 'standard' | 'premium';
}

interface PurchaseFlowState {
  checkingPurchase: boolean;
  hasCheckedPurchase: boolean;
  showContent: boolean;
  loadingError: string | null;
  purchaseError: string | null;
  purchaseCheck: PurchaseCheck | null;
  paymentStatus: PaymentStatus;
  showPaymentModal: boolean;
}

export function usePurchaseFlow({ moduleId, selectedPlan }: UsePurchaseFlowProps) {
  const { user } = useAuth();
  const { canPurchaseProduct } = usePurchases();
  const { loading, processPurchase } = usePayment();
  const [state, setState] = useState<PurchaseFlowState>({
    checkingPurchase: true,
    hasCheckedPurchase: false,
    showContent: false,
    loadingError: null,
    purchaseError: null,
    purchaseCheck: null,
    paymentStatus: null,
    showPaymentModal: false
  });

  const isFullCourse = moduleId === 'full-course';

  useEffect(() => {
    const checkPurchaseEligibility = async () => {
      if (!user) return;
      try {
        setState(s => ({
          ...s,
          loadingError: null,
          purchaseError: null,
          checkingPurchase: true
        }));
        
        // First check if user owns standard course
        const standardCheck = await canPurchaseProduct('full-course');
        const ownsStandard = standardCheck.reason === 'already_owned';

        // If checking full course and user owns standard, check premium upgrade
        if (isFullCourse && ownsStandard) {
          const premiumCheck = await canPurchaseProduct('full-course-premium');
          setState(s => ({
            ...s,
            purchaseCheck: premiumCheck,
            hasCheckedPurchase: true
          }));
          return;
        }

        // Otherwise check the requested product
        const productId = isFullCourse ? 'full-course' : moduleId;

        const result = await canPurchaseProduct(productId);
        
        setState(s => ({
          ...s,
          purchaseCheck: result,
          hasCheckedPurchase: true
        }));
      } catch (error) {
        console.error('Error checking purchase eligibility:', error);
        setState(s => ({
          ...s,
          purchaseError: 'Unable to check purchase eligibility. Please try again.',
          loadingError: 'Unable to load purchase information. Please try again.'
        }));
      } finally {
        setState(s => ({
          ...s,
          checkingPurchase: false
        }));
      }
    };

    checkPurchaseEligibility();
  }, [user, moduleId, isFullCourse, selectedPlan]);

  useEffect(() => {
    if (!state.checkingPurchase && !state.loadingError && state.hasCheckedPurchase) {
      setState(s => ({ ...s, showContent: true }));
    }
  }, [state.checkingPurchase, state.loadingError, state.hasCheckedPurchase]);

  const handlePurchase = async () => {
    if (!state.purchaseCheck?.allowed) return;

    setState(s => ({
      ...s,
      showPaymentModal: true,
      purchaseError: null
    }));

    const productId = isFullCourse 
      ? selectedPlan === 'premium' && state.purchaseCheck?.reason === 'upgrade'
        ? 'full-course-premium'
        : 'full-course'
      : moduleId;

    try {
      const result = await processPurchase(
        productId,
        state.purchaseCheck.finalPrice
      );

      setState(s => ({
        ...s,
        paymentStatus: result.success ? 'success' : 'failure',
        purchaseError: result.success ? null : (result.error || 'Payment failed. Please try again.')
      }));

    } catch (error) {
      console.error('Purchase failed:', error);
      setState(s => ({
        ...s,
        paymentStatus: 'failure',
        purchaseError: error instanceof Error ? error.message : 'An unexpected error occurred'
      }));
    }
  };

  const closePaymentModal = () => {
    setState(s => ({
      ...s,
      showPaymentModal: false,
      paymentStatus: null
    }));
  };

  return {
    state,
    loading,
    handlePurchase,
    closePaymentModal,
    ownsStandardCourse: state.purchaseCheck?.reason === 'already_owned' && 
      isFullCourse && selectedPlan === 'standard',
    isUpgrade: state.purchaseCheck?.reason === 'upgrade' && 
      isFullCourse && selectedPlan === 'premium'
  };
}