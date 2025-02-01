import { useState } from 'react';
import { purchaseManager } from '../lib/PurchaseManager';
import { useAuth } from '../contexts/AuthContext';

interface PaymentResult {
  success: boolean;
  error?: string;
  details?: Record<string, any>;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const processPurchase = async (
    productId: string,
    amount: number,
    paymentMethod: string = 'card',
    options: { timeout?: number; maxRetries?: number } = {}
  ): Promise<PaymentResult> => {
    if (!user) {
      return {
        success: false,
        error: 'User must be logged in to make a purchase'
      };
    }

    // Validate amount
    if (amount <= 0 || isNaN(amount)) {
      return {
        success: false,
        error: 'Invalid payment amount'
      };
    }

    // Validate product ID format
    if (!/^[a-zA-Z0-9-]+$/.test(productId)) {
      return {
        success: false,
        error: 'Invalid product ID format'
      };
    }

    // Sanitize payment method
    const validPaymentMethods = ['card', 'paypal'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return {
        success: false,
        error: 'Invalid payment method'
      };
    }

    setLoading(true);
    try {
      const result = await purchaseManager.processPurchase({
        userId: user.id,
        productId,
        amount,
        paymentMethod,
        timeout: options.timeout || 15000,
        maxRetries: options.maxRetries || 3
      });

      if (!result.success && result.details) {
        console.error('Purchase processing details:', result.details);
      }

      return {
        success: result.success,
        error: result.error,
        details: result.details
      };
    } catch (error) {
      const errorDetails = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        details: (error as any).details
      } : { error };

      console.error('Payment processing error:', errorDetails);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        details: errorDetails
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    processPurchase
  };
}