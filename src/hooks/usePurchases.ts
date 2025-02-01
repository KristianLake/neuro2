import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Purchase, Product, PurchaseWithProduct } from '../types/purchase';
import { useCallback } from 'react';

import { useApi } from './useApi';
import { rateLimit } from '../middleware/rateLimit';

export function usePurchases() {
  const { user } = useAuth();
  const { api } = useApi();

  const getProducts = async (): Promise<Product[]> => {
    try {
      // Add caching headers
      return await api<Product[]>('products', {
        headers: {
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const getProduct = async (productId: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  const getUserPurchases = useCallback(async (): Promise<PurchaseWithProduct[]> => {
    if (!user) return [];

    // Rate limit check
    const { success, error } = await rateLimit('api')(user.id);
    if (!success) {
      throw new Error(error);
    }

    try {
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          products:products!inner(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      const { data: access, error: accessError } = await supabase
        .from('course_access')
        .select('*')
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      // Transform the data to match PurchaseWithProduct type
      const purchasesWithAccess = (purchases || []).map(purchase => ({
        ...purchase,
        products: purchase.products,
        access: access?.find(a => a.module_id === purchase.product_id),
        user: {
          email: user.email,
          user_metadata: user.user_metadata
        }
      }));

      return purchasesWithAccess;
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      return [];
    }
  }, [user]);

  const createPurchase = async (productId: string, amount: number, paymentMethod: string): Promise<Purchase | null> => {
    if (!user) return null;

    console.log('Creating purchase record:', { productId, amount, paymentMethod });

    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([{
          user_id: user.id,
          product_id: productId,
          amount,
          status: 'pending',
          payment_method: paymentMethod
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating purchase record:', error);
        throw error;
      }

      console.log('Purchase record created:', data);
      return data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      return null;
    }
  };

  const updatePurchaseStatus = async (purchaseId: string, status: Purchase['status']): Promise<boolean> => {
    if (!user) return false;

    const MAX_VERIFICATION_ATTEMPTS = 3;
    const VERIFICATION_DELAY = 1000; // 1 second
    const TRANSACTION_TIMEOUT = 10000; // 10 seconds
    const VERIFICATION_TIMEOUT = 5000; // 5 seconds per attempt
    const INITIAL_UPDATE_TIMEOUT = 3000; // 3 seconds for initial update
    const MAX_NETWORK_RETRIES = 2;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout')), TRANSACTION_TIMEOUT);
      });

      console.log('Starting purchase status update:', { purchaseId, status, userId: user.id });

      // Helper function for retrying network requests
      const retryNetworkRequest = async <T>(
        operation: () => Promise<T>,
        retries = MAX_NETWORK_RETRIES
      ): Promise<T> => {
        let lastError: any;
        for (let i = 0; i <= retries; i++) {
          try {
            return await operation();
          } catch (error) {
            lastError = error;
            if (i < retries) {
              const delay = Math.min(VERIFICATION_DELAY * Math.pow(2, i), 3000);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        throw lastError;
      };

      // Verify purchase with retries
      const { data: purchase, error: verifyError } = await retryNetworkRequest(async () => {
        const result = await Promise.race<any>([
          supabase
            .from('purchases')
            .select('id, status')
            .match({ id: purchaseId, user_id: user.id })
            .single(),
          timeoutPromise
        ]);
        return result;
      });

      if (verifyError || !purchase) {
        console.error('Purchase verification failed:', verifyError);
        return false;
      }

      console.log('Current purchase state:', { 
        id: purchase.id,
        currentStatus: purchase.status,
        targetStatus: status
      });

      // Don't update if already in target state
      if (purchase.status === status) {
        console.log('Purchase already in target state:', status);
        return true;
      }

      // Update with transaction timeout
      const { error: updateError } = await retryNetworkRequest(async () => {
        const result = await Promise.race([
          supabase
            .from('purchases')
            .update({ status, updated_at: new Date().toISOString() })
            .match({ id: purchaseId, user_id: user.id })
            .select(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Update timeout')), INITIAL_UPDATE_TIMEOUT)
          )
        ]);
        return result;
      });

      if (updateError) {
        console.error('Database error updating purchase:', updateError);
        throw updateError;
      }

      // Verify the update with retries
      for (let attempt = 1; attempt <= MAX_VERIFICATION_ATTEMPTS; attempt++) {
        const startTime = Date.now();
        console.log(`Starting verification attempt ${attempt} of ${MAX_VERIFICATION_ATTEMPTS}`);

        // Add increasing delay between verification attempts
        const backoffDelay = Math.min(VERIFICATION_DELAY * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));

        // Race between verification and timeout
        try {
          const { data: verifiedUpdate, error: verifyUpdateError } = await retryNetworkRequest(async () => {
            const result = await Promise.race<any>([
              supabase
                .from('purchases')
                .select('id, status')
                .match({ id: purchaseId, user_id: user.id })
                .single(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Verification timeout')), VERIFICATION_TIMEOUT)
              )
            ]);
            return result;
          });

          if (verifyUpdateError) {
            const elapsed = Date.now() - startTime;
            console.error(`Verification attempt ${attempt} failed after ${elapsed}ms:`, verifyUpdateError);
            if (attempt === MAX_VERIFICATION_ATTEMPTS) {
              console.error('All verification attempts failed');
              return false;
            }
            continue;
          }

          if (!verifiedUpdate) {
            const elapsed = Date.now() - startTime;
            console.error(`Verification attempt ${attempt}: Purchase not found after ${elapsed}ms`);
            if (attempt === MAX_VERIFICATION_ATTEMPTS) {
              console.error('Purchase not found after all attempts');
              return false;
            }
            continue;
          }

          if (verifiedUpdate.status === status) {
            const elapsed = Date.now() - startTime;
            console.log(`Purchase status verified successfully after ${elapsed}ms:`, {
              id: verifiedUpdate.id,
              status: verifiedUpdate.status,
              attempts: attempt
            });
            return true;
          }

          const elapsed = Date.now() - startTime;
          console.error(`Verification attempt ${attempt} status mismatch after ${elapsed}ms:`, {
            expected: status,
            actual: verifiedUpdate.status
          });

          // On last attempt, try one final update
          if (attempt === MAX_VERIFICATION_ATTEMPTS) {
            try {
              console.log('Making final update attempt');
              const { error: finalError } = await retryNetworkRequest(async () => {
                return await supabase
                  .from('purchases')
                  .update({ status, updated_at: new Date().toISOString() })
                  .match({ id: purchaseId, user_id: user.id });
              });
              
              if (!finalError) {
                console.log('Final update successful');
                return true;
              }
              
              console.error('Final update failed:', finalError);
              return false;
            } catch (finalError) {
              console.error('Final update attempt failed:', finalError);
              return false;
            }
          }
        } catch (verifyError) {
          const elapsed = Date.now() - startTime;
          console.error(`Verification attempt ${attempt} error after ${elapsed}ms:`, 
            verifyError instanceof Error ? verifyError.message : verifyError
          );
          if (attempt === MAX_VERIFICATION_ATTEMPTS) {
            console.error('All verification attempts exhausted');
            return false;
          }
        }
      }

      return false;
    } catch (error) {
      if (error instanceof Error && error.message === 'Transaction timeout') {
        console.error('Transaction timeout updating purchase status:', {
          purchaseId,
          targetStatus: status,
          timeout: TRANSACTION_TIMEOUT
        });
      } else {
        console.error('Error updating purchase status:', error);
      }
      return false;
    }
  };

  const canPurchaseProduct = async (productId: string): Promise<{
    allowed: boolean;
    reason?: string;
    originalPrice: number;
    finalPrice: number;
    discount: number;
    ownedModules: string[];
  }> => {
    if (!user) return {
      allowed: false,
      reason: 'not_authenticated',
      originalPrice: 0,
      finalPrice: 0,
      discount: 0,
      ownedModules: []
    };

    try {
      const { data, error } = await supabase
        .rpc('can_purchase_product', {
          p_user_id: user.id,
          p_product_id: productId
        });

      if (error) throw error;

      return {
        allowed: data.allowed,
        reason: data.reason,
        originalPrice: data.original_price,
        finalPrice: data.final_price,
        discount: data.discount,
        ownedModules: data.owned_modules || []
      };
    } catch (error) {
      console.error('Error checking purchase eligibility:', error);
      throw error;
    }
  };

  return {
    getProducts,
    getProduct,
    getUserPurchases,
    canPurchaseProduct,
    createPurchase,
    updatePurchaseStatus
  };
}