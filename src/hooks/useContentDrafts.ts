import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ContentDraft {
  id: string;
  contentId: string;
  version: number;
  data: any;
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  visibility: 'private' | 'restricted' | 'public';
  publishAt?: string;
  publishedAt?: string;
  archivedAt?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export function useContentDrafts(contentId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get latest draft
  const getLatestDraft = useCallback(async (): Promise<ContentDraft | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: draftError } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('content_id', contentId)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (draftError) throw draftError;

      return data;
    } catch (err) {
      console.error('Error getting latest draft:', err);
      setError('Failed to get latest draft');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  // Create new draft
  const createDraft = useCallback(async (data: any): Promise<ContentDraft | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      // Get current version
      const currentDraft = await getLatestDraft();
      const newVersion = currentDraft ? currentDraft.version + 1 : 1;

      const { data: newDraft, error: createError } = await supabase
        .from('content_drafts')
        .insert([{
          content_id: contentId,
          version: newVersion,
          data,
          status: 'draft',
          visibility: 'private',
          created_by: user.id,
          updated_by: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      return newDraft;
    } catch (err) {
      console.error('Error creating draft:', err);
      setError('Failed to create draft');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, contentId, getLatestDraft]);

  // Update draft
  const updateDraft = useCallback(async (
    draftId: string,
    updates: Partial<ContentDraft>
  ): Promise<ContentDraft | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('content_drafts')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', draftId)
        .select()
        .single();

      if (updateError) throw updateError;

      return data;
    } catch (err) {
      console.error('Error updating draft:', err);
      setError('Failed to update draft');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    getLatestDraft,
    createDraft,
    updateDraft
  };
}