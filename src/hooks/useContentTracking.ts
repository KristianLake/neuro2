import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ContentView {
  contentId: string;
  userId: string;
  viewedAt: string;
  timeSpent: number;
  completed: boolean;
}

export function useContentTracking(contentId: string) {
  const { user } = useAuth();
  const [startTime] = useState(Date.now());
  const [isTracking, setIsTracking] = useState(true);

  const trackView = useCallback(async (completed: boolean = false) => {
    if (!user || !isTracking) return;

    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000); // in seconds
      
      const view: ContentView = {
        contentId,
        userId: user.id,
        viewedAt: new Date().toISOString(),
        timeSpent,
        completed
      };

      const { error } = await supabase
        .from('content_views')
        .insert([view]);

      if (error) throw error;

      // Stop tracking after recording view
      setIsTracking(false);
    } catch (err) {
      console.error('Error tracking content view:', err);
    }
  }, [user, contentId, startTime, isTracking]);

  // Track view on unmount if not already tracked
  const cleanup = useCallback(() => {
    if (isTracking) {
      trackView(false);
    }
  }, [isTracking, trackView]);

  return {
    trackView,
    cleanup
  };
}