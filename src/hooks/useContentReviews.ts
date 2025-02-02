import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ContentReview {
  id: string;
  draftId: string;
  reviewerId: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export function useContentReviews(draftId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get reviews
  const getReviews = useCallback(async (): Promise<ContentReview[]> => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);

      const { data, error: reviewsError } = await supabase
        .from('content_reviews')
        .select('*')
        .eq('draft_id', draftId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      return data;
    } catch (err) {
      console.error('Error getting reviews:', err);
      setError('Failed to get reviews');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, draftId]);

  // Create review
  const createReview = useCallback(async (
    status: 'approved' | 'rejected',
    feedback?: string
  ): Promise<ContentReview | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('content_reviews')
        .insert([{
          draft_id: draftId,
          reviewer_id: user.id,
          status,
          feedback
        }])
        .select()
        .single();

      if (createError) throw createError;

      return data;
    } catch (err) {
      console.error('Error creating review:', err);
      setError('Failed to create review');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, draftId]);

  return {
    loading,
    error,
    getReviews,
    createReview
  };
}