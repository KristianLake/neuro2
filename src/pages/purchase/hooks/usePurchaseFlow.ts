import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { usePurchases } from '../../../hooks/usePurchases';
import { usePayment } from '../../../hooks/usePayment';
import { PaymentStatus } from '../types/payments';

interface PurchaseFlowState {
  checkingPurchase: boolean;
  purchaseCheck: {
    allowed: boolean;
    reason?: string;
    originalPrice: number;
    finalPrice: number;
    discount: number;
    ownedModules: string[];
  } | null;
  loadingError: string | null;
  purchaseError: string | null;
  paymentStatus: PaymentStatus | null;
  showPaymentModal: boolean;
  showContent: boolean;
}

interface UsePurchaseFlowProps {
  moduleId: string | undefined;
}

export function usePurchaseFlow({ moduleId }: UsePurchaseFlowProps) {
  const { user } = useAuth();
  const { canPurchaseProduct } = usePurchases();
  const { loading, processPurchase } = usePayment();
  const [state, setState] = useState<PurchaseFlowState>({
    checkingPurchase: false,
    purchaseCheck: null,
    loadingError: null,
    purchaseError: null,
    paymentStatus: null,
    showPaymentModal: false,
    showContent: false,
  });

  useEffect(() => {
    // Only run if both the user and moduleId exist.
    if (!user || !moduleId) return;

    const checkEligibility = async () => {
      setState(prev => ({
        ...prev,
        checkingPurchase: true,
        loadingError: null,
        purchaseError: null,
        showContent: false,
      }));

      try {
        // Call the database function via RPC using the passed moduleId.
        const result = await canPurchaseProduct(moduleId);
        setState(prev => ({
          ...prev,
          purchaseCheck: result,
          showContent: true,
        }));
      } catch (error) {
        console.error('Error checking purchase eligibility:', error);
        setState(prev => ({
          ...prev,
          purchaseError: 'Unable to check purchase eligibility. Please try again.',
          loadingError: 'Unable to load purchase information. Please try again.',
        }));
      } finally {
        setState(prev => ({
          ...prev,
          checkingPurchase: false,
        }));
      }
    };

    checkEligibility();
  }, [user, moduleId, canPurchaseProduct]);

  const handlePurchase = async () => {
    if (!state.purchaseCheck?.allowed) return;

    setState(prev => ({
      ...prev,
      showPaymentModal: true,
      purchaseError: null,
    }));

    try {
      // Use moduleId as the product ID and the final price from the purchase check.
      const result = await processPurchase(
        moduleId,
        state.purchaseCheck.finalPrice
      );

      setState(prev => ({
        ...prev,
        paymentStatus: result.success ? 'success' : 'failure',
        purchaseError: result.success ? null : (result.error || 'Payment failed. Please try again.'),
      }));
    } catch (error) {
      console.error('Purchase failed:', error);
      setState(prev => ({
        ...prev,
        paymentStatus: 'failure',
        purchaseError: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  };

  const closePaymentModal = () => {
    setState(prev => ({
      ...prev,
      showPaymentModal: false,
      paymentStatus: null,
    }));
  };

  return {
    state,
    loading,
    handlePurchase,
    closePaymentModal,
  };
}
