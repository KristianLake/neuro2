import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ContentState {
  contentId: string;
  version: number;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  visibility: 'private' | 'restricted' | 'public';
  publishAt?: string;
  publishedAt?: string;
  archivedAt?: string;
}

interface ContentReview {
  contentId: string;
  version: number;
  reviewerId: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

export function useContentPublishing(contentId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get content state
  const getContentState = useCallback(async () => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: stateError } = await supabase
        .from('content_states')
        .select('*')
        .eq('content_id', contentId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (stateError) throw stateError;

      return data as ContentState;
    } catch (err) {
      console.error('Error getting content state:', err);
      setError('Failed to get content state');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  // Create new draft
  const createDraft = useCallback(async () => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      // Get current version
      const currentState = await getContentState();
      const newVersion = currentState ? currentState.version + 1 : 1;

      const { data, error: createError } = await supabase
        .from('content_states')
        .insert([{
          content_id: contentId,
          version: newVersion,
          status: 'draft',
          visibility: 'private',
          created_by: user.id,
          updated_by: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      return data as ContentState;
    } catch (err) {
      console.error('Error creating draft:', err);
      setError('Failed to create draft');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, contentId, getContentState]);

  // Submit for review
  const submitForReview = useCallback(async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('content_states')
        .update({
          status: 'in_review',
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('content_id', contentId)
        .eq('status', 'draft');

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      console.error('Error submitting for review:', err);
      setError('Failed to submit for review');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  // Review content
  const reviewContent = useCallback(async (
    approved: boolean,
    feedback?: string
  ) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // Create review record
      const { error: reviewError } = await supabase
        .from('content_reviews')
        .insert([{
          content_id: contentId,
          version: (await getContentState())?.version || 1,
          reviewer_id: user.id,
          status: approved ? 'approved' : 'rejected',
          feedback
        }]);

      if (reviewError) throw reviewError;

      // Update content state
      const { error: updateError } = await supabase
        .from('content_states')
        .update({
          status: approved ? 'approved' : 'draft',
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('content_id', contentId)
        .eq('status', 'in_review');

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      console.error('Error reviewing content:', err);
      setError('Failed to review content');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, contentId, getContentState]);

  // Publish content
  const publishContent = useCallback(async (publishAt?: Date) => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: publishError } = await supabase
        .rpc('publish_content', {
          p_content_id: contentId,
          p_user_id: user.id,
          p_publish_at: publishAt?.toISOString()
        });

      if (publishError) throw publishError;

      return true;
    } catch (err) {
      console.error('Error publishing content:', err);
      setError('Failed to publish content');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  // Archive content
  const archiveContent = useCallback(async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: archiveError } = await supabase
        .from('content_states')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('content_id', contentId)
        .eq('status', 'published');

      if (archiveError) throw archiveError;

      return true;
    } catch (err) {
      console.error('Error archiving content:', err);
      setError('Failed to archive content');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  return {
    loading,
    error,
    getContentState,
    createDraft,
    submitForReview,
    reviewContent,
    publishContent,
    archiveContent
  };
}