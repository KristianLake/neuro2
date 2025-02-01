import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Bookmark {
  id: string;
  userId: string;
  contentId: string;
  note?: string;
  createdAt: string;
}

export function useContentBookmarks(contentId: string) {
  const { user } = useAuth();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load bookmark
  useEffect(() => {
    const loadBookmark = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error: bookmarkError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .single();

        if (bookmarkError && bookmarkError.code !== 'PGRST116') {
          throw bookmarkError;
        }

        setBookmark(data);
      } catch (err) {
        console.error('Error loading bookmark:', err);
        setError('Failed to load bookmark');
      } finally {
        setLoading(false);
      }
    };

    loadBookmark();
  }, [user, contentId]);

  // Add bookmark
  const addBookmark = useCallback(async (note?: string) => {
    if (!user) return;

    try {
      const newBookmark: Omit<Bookmark, 'id'> = {
        userId: user.id,
        contentId,
        note,
        createdAt: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('bookmarks')
        .insert([newBookmark])
        .select()
        .single();

      if (error) throw error;

      setBookmark(data);
    } catch (err) {
      console.error('Error adding bookmark:', err);
      throw err;
    }
  }, [user, contentId]);

  // Remove bookmark
  const removeBookmark = useCallback(async () => {
    if (!user || !bookmark) return;

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id);

      if (error) throw error;

      setBookmark(null);
    } catch (err) {
      console.error('Error removing bookmark:', err);
      throw err;
    }
  }, [user, bookmark]);

  // Update bookmark note
  const updateBookmarkNote = useCallback(async (note: string) => {
    if (!user || !bookmark) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .update({ note })
        .eq('id', bookmark.id)
        .select()
        .single();

      if (error) throw error;

      setBookmark(data);
    } catch (err) {
      console.error('Error updating bookmark note:', err);
      throw err;
    }
  }, [user, bookmark]);

  return {
    bookmark,
    loading,
    error,
    addBookmark,
    removeBookmark,
    updateBookmarkNote
  };
}