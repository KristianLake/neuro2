import { supabase } from './supabase';
import { Purchase } from '../types/purchase';

interface PurchaseOptions {
  userId: string;
  productId: string;
  amount: number;
  paymentMethod?: string;
  maxRetries?: number;
  timeout?: number;
}

interface PurchaseResult {
  success: boolean;
  purchaseId?: string;
  error?: string;
  status?: Purchase['status'];
  details?: Record<string, any>;
}

class PurchaseManager {
  private static instance: PurchaseManager;
  private readonly DEFAULT_TIMEOUT = 15000; // 15 seconds
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second base delay
  private readonly MAX_RETRY_DELAY = 3000; // 3 seconds max delay
  private readonly STATUS_CHECK_INTERVAL = 1000; // 1 second
  private readonly NETWORK_RETRY_DELAY = 1000; // 1 second
  private readonly VERIFICATION_TIMEOUT = 5000; // 5 seconds per verification attempt

  private constructor() {}

  public static getInstance(): PurchaseManager {
    if (!PurchaseManager.instance) {
      PurchaseManager.instance = new PurchaseManager();
    }
    return PurchaseManager.instance;
  }

  private createError(message: string, details?: Record<string, any>): Error {
    const error = new Error(message);
    if (details) {
      (error as any).details = details;
    }
    return error;
  }

  private async retryNetworkRequest<T>(
    operation: () => Promise<T>,
    retries = 2
  ): Promise<T> {
    let lastError: any;
    for (let i = 0; i <= retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < retries) {
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              Math.min(this.NETWORK_RETRY_DELAY * Math.pow(2, i), this.MAX_RETRY_DELAY)
            )
          );
        }
      }
    }
    throw this.createError(
      'Network request failed after retries',
      { originalError: lastError }
    );
  }

  private async createPurchaseRecord(options: PurchaseOptions): Promise<string> {
    try {
      // Rate limit check
      const rateLimitResult = await rateLimit('api')(options.userId);
      if (!rateLimitResult.success) {
        throw this.createError('Rate limit exceeded', { error: rateLimitResult.error });
      }

      const { data, error: supabaseError } = await this.retryNetworkRequest(async () => {
        return await supabase
          .from('purchases')
          .insert([
            {
              user_id: options.userId,
              product_id: options.productId,
              amount: options.amount,
              status: 'pending',
              payment_method: options.paymentMethod || 'card',
            },
          ])
          .select()
          .single();
      });

      if (supabaseError) {
        throw this.createError('Failed to create purchase record', {
          supabaseError,
          options
        });
      }

      if (!data) {
        throw this.createError('No purchase record created', { options });
      }

      return data.id;
    } catch (error) {
      throw this.createError(
        'Error creating purchase record',
        { originalError: error, options }
      );
    }
  }

  private async verifyPurchaseStatus(
    purchaseId: string,
    userId: string,
    expectedStatus: Purchase['status'],
    signal?: AbortSignal
  ): Promise<boolean> {
    try {
      console.log('Starting status verification:', { 
        purchaseId, 
        userId, 
        expectedStatus,
        timestamp: new Date().toISOString()
      });

      const verificationPromise = this.retryNetworkRequest(async () => {
        return await supabase
          .from('purchases')
          .select('status, version')
          .match({ id: purchaseId, user_id: userId })
          .maybeSingle();
      });

      const result = await Promise.race([
        verificationPromise,
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(this.createError('Verification timeout')), this.VERIFICATION_TIMEOUT);
        }),
      ]);

      console.log('Verification Query Result:', result);

      if (result.error) {
        // For PGRST116 (no rows), treat as not found
        if (result.error.code === 'PGRST116') {
          console.log('Purchase not found during verification:', purchaseId);
          return false;
        }
        // For other errors, throw
        throw this.createError('Supabase query failed', { 
          error: result.error,
          purchaseId,
          userId 
        });
      }

      if (!result.data || !result.data.status) {
        console.log('No data returned during verification:', purchaseId);
        return false;
      }

      if (signal?.aborted) {
        throw this.createError('Operation aborted');
      }

      console.log('Purchase status verified:', { purchaseId, status: result.data.status });

      // If status matches expected, return true
      if (result.data.status === expectedStatus) {
        return true;
      }

      // If status is still pending, return false to trigger retry
      if (result.data.status === 'pending') {
        return false;
      }

      // If status is different from expected and not pending, throw error
      console.log('Purchase status mismatch:', {
        purchaseId,
        expected: expectedStatus,
        actual: result.data.status
      });
      return false;

    } catch (error) {
      console.error('Error during status verification:', { error });
      throw error;
    }
  }

  private async updatePurchaseStatus(
    purchaseId: string,
    userId: string,
    status: Purchase['status'],
    statusReason?: string,
    signal?: AbortSignal,
    retryCount: number = 0
  ): Promise<void> {
    if (signal?.aborted) {
      throw this.createError('Operation aborted');
    }

    // Prevent infinite retries
    if (retryCount >= 3) {
      console.log('Max retry attempts reached, checking final status');
      
      // Check final status before giving up
      const { data: finalStatus } = await supabase
        .from('purchases')
        .select('status')
        .match({ id: purchaseId, user_id: userId })
        .maybeSingle();
      
      if (finalStatus?.status === status) {
        console.log('Status already matches target:', status);
        return;
      }
      
      throw this.createError('Failed to update status after retries', {
        purchaseId,
        currentStatus: finalStatus?.status,
        targetStatus: status,
        retryCount
      });
    }

    try {
      console.log('Updating purchase status:', { purchaseId, userId, status });

      // Get current status first
      const { data: currentData, error: currentError } = await supabase
        .from('purchases')
        .select('status, version')
        .match({ id: purchaseId, user_id: userId })
        .maybeSingle();

      if (currentError) {
        // Handle case where no rows are found
        if (currentError.code === 'PGRST116') {
          console.log('Purchase not found during status check:', purchaseId);
          return;
        }
        throw this.createError('Failed to get current status', {
          error: currentError,
          purchaseId
        });
      }

      if (!currentData) {
        console.log('Purchase not found during status check:', purchaseId);
        return;
      }

      // Don't update if already in target state
      if (currentData.status === status) {
        console.log('Purchase already in target state:', status);
        return;
      }

      // Don't retry if status is already final
      if (currentData.status === 'completed' || currentData.status === 'failed') {
        console.log('Cannot update final status:', {
          purchaseId,
          currentStatus: currentData.status,
          targetStatus: status
        });
        return;
      }

      const result = await this.retryNetworkRequest(async () => {
        return await supabase
          .rpc('update_purchase_status_v4', {
            p_purchase_id: purchaseId,
            p_user_id: userId,
            p_current_status: currentData.status,
            p_new_status: status,
            p_version: currentData.version,
            p_status_reason: statusReason
          });
      });

      console.log('Status update result:', result);

      if (result.error) {
        throw this.createError('Failed to update purchase status', {
          supabaseError: result.error,
          purchaseId,
          status
        });
      }

      // If update failed, retry
      if (!result.data) {
        console.log('Status update failed, retrying...');
        return await this.updatePurchaseStatus(purchaseId, userId, status, signal, retryCount + 1);
      }

      // Verify the update was successful
      const { data: verifyData, error: verifyError } = await supabase
        .from('purchases')
        .select('status')
        .match({ id: purchaseId, user_id: userId })
        .single();

      if (verifyError) {
        console.log('Failed to verify status update, retrying...', verifyError);
        return await this.updatePurchaseStatus(purchaseId, userId, status, signal, retryCount + 1);
      }

      if (!verifyData) {
        console.log('Purchase not found during verification:', purchaseId);
        return;
      }

      if (verifyData.status !== status) {
        // Status is different than expected - retry the update
        console.log('Status verification failed, retrying update...');
        return await this.updatePurchaseStatus(purchaseId, userId, status, signal, retryCount + 1);
      }

    } catch (error) {
      throw this.createError(
        'Error updating purchase status',
        { originalError: error, purchaseId, status }
      );
    }
  }

  public async processPurchase(options: PurchaseOptions): Promise<PurchaseResult> {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, options.timeout || this.DEFAULT_TIMEOUT);

    let purchaseId: string | undefined;
    let currentStatus: Purchase['status'] = 'pending';
    let lastVerificationError: Error | null = null;

    try {
      // Create initial purchase record
      purchaseId = await this.createPurchaseRecord(options);
      console.log('Purchase record created:', purchaseId);

      // Simulate payment processing (replace with real payment gateway)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const success = Math.random() > 0.5;
      
      // Simulate different failure reasons
      let failureReason;
      if (!success) {
        const failureReasons = [
          'Insufficient funds',
          'Card declined by issuer',
          'Card expired',
          'Invalid card number',
          'Security code verification failed',
          'Transaction limit exceeded',
          'Suspected fraud',
          'Network error during processing'
        ];
        failureReason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      }
      
      const targetStatus = success ? 'completed' : 'failed';

      if (abortController.signal.aborted) {
        throw this.createError('Operation aborted');
      }

      // Update purchase status
      await this.updatePurchaseStatus(purchaseId, options.userId, targetStatus, failureReason, abortController.signal);
      currentStatus = targetStatus;
      console.log('Initial status update completed:', targetStatus);

      // Verify status update with retries
      const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES;
      let verified = false;
      let attempt = 0;

      while (!verified && attempt < maxRetries && !abortController.signal.aborted) {
        attempt++;
        console.log(`Verification attempt ${attempt} of ${maxRetries}`);

        try {
          verified = await this.verifyPurchaseStatus(
            purchaseId,
            options.userId,
            targetStatus,
            abortController.signal
          );

          if (verified) {
            console.log('Status verified successfully:', targetStatus);
            break;
          }

          if (abortController.signal.aborted) {
            throw this.createError('Operation aborted');
          }

          // Add exponential backoff delay
          const delay = Math.min(
            this.RETRY_DELAY * Math.pow(2, attempt - 1),
            this.MAX_RETRY_DELAY
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } catch (error) {
          lastVerificationError = error instanceof Error ? error : new Error(String(error));
          console.error(`Verification attempt ${attempt} failed:`, error);
          
          // If error is status mismatch, stop retrying
          if (error instanceof Error && error.message === 'Purchase status mismatch') {
            throw error;
          }
          
          // For other errors, continue retrying until max attempts
          if (attempt === maxRetries) {
            throw lastVerificationError;
          }
        }
      }

      if (!verified) {
        // Final attempt to update status
        await this.updatePurchaseStatus(purchaseId, options.userId, 'failed', abortController.signal);
        currentStatus = 'failed';
        throw this.createError(
          'Failed to verify purchase status',
          { attempts: attempt, lastError: lastVerificationError }
        );
      }

      return {
        success: targetStatus === 'completed',
        purchaseId,
        status: currentStatus
      };

    } catch (error) {
      const errorDetails = error instanceof Error ? {
        message: error.message,
        details: (error as any).details,
        stack: error.stack
      } : { error };

      console.error('Purchase processing error:', errorDetails);

      return {
        success: false,
        purchaseId,
        status: currentStatus,
        error: error instanceof Error ? error.message : 'Purchase processing failed',
        details: errorDetails
      };
    } finally {
      clearTimeout(timeoutId);
      if (abortController.signal.aborted && purchaseId) {
        try {
          await this.updatePurchaseStatus(purchaseId, options.userId, 'failed');
        } catch (error) {
          console.error('Error updating aborted purchase status:', error);
        }
      }
    }
  }
}

export const purchaseManager = PurchaseManager.getInstance();