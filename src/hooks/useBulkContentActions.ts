import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type BulkActionType = 'publish' | 'unpublish' | 'archive';

interface BulkAction {
  id: string;
  actionType: BulkActionType;
  contentIds: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorDetails?: Record<string, any>[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function useBulkContentActions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create bulk action
  const createBulkAction = useCallback(async (
    actionType: BulkActionType,
    contentIds: string[]
  ): Promise<BulkAction | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('content_bulk_actions')
        .insert([{
          action_type: actionType,
          content_ids: contentIds,
          status: 'pending',
          created_by: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      // Start processing
      const { error: processError } = await supabase
        .rpc('process_bulk_content_action', {
          p_action_id: data.id
        });

      if (processError) throw processError;

      return data;
    } catch (err) {
      console.error('Error creating bulk action:', err);
      setError('Failed to create bulk action');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get bulk action status
  const getBulkActionStatus = useCallback(async (
    actionId: string
  ): Promise<BulkAction | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: statusError } = await supabase
        .from('content_bulk_actions')
        .select('*')
        .eq('id', actionId)
        .single();

      if (statusError) throw statusError;

      return data;
    } catch (err) {
      console.error('Error getting bulk action status:', err);
      setError('Failed to get bulk action status');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    createBulkAction,
    getBulkActionStatus
  };
}