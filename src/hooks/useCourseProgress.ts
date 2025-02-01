import { useState, useCallback, useEffect } from 'react';
import { Course, Progress } from '../components/course/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCourseProgress(course: Course) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load progress from database
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get all content IDs from the course
        const contentIds = course.modules.flatMap(module => 
          module.contents.map(content => content.id)
        );

        const { data, error: fetchError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('content_id', contentIds);

        if (fetchError) throw fetchError;

        // Convert to progress map
        const progressMap = (data || []).reduce((acc, item) => ({
          ...acc,
          [item.content_id]: {
            contentId: item.content_id,
            userId: item.user_id,
            status: item.status,
            progress: item.progress,
            score: item.score,
            attempts: item.attempts,
            timeSpent: item.time_spent,
            lastAccessed: item.last_accessed_at,
            completedAt: item.completed_at
          }
        }), {});

        setProgress(progressMap);
      } catch (err) {
        console.error('Error loading progress:', err);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user?.id, course]);

  // Update progress
  const updateProgress = useCallback(async (
    contentId: string,
    update: Partial<Progress>
  ) => {
    if (!user) return;

    try {
      const now = new Date().toISOString();
      const currentProgress = progress[contentId];

      const updatedProgress = {
        user_id: user.id,
        content_id: contentId,
        status: currentProgress?.status || 'not_started',
        progress: currentProgress?.progress || 0,
        score: currentProgress?.score,
        attempts: (currentProgress?.attempts || 0) + 1,
        time_spent: currentProgress?.timeSpent || 0,
        last_accessed_at: now,
        completed_at: update.status === 'completed' ? now : currentProgress?.completedAt,
        ...update
      };

      const { error: updateError } = await supabase
        .from('user_progress')
        .upsert(updatedProgress);

      if (updateError) throw updateError;

      // Update local state
      setProgress(prev => ({
        ...prev,
        [contentId]: {
          contentId,
          userId: user.id,
          status: updatedProgress.status,
          progress: updatedProgress.progress,
          score: updatedProgress.score,
          attempts: updatedProgress.attempts,
          timeSpent: updatedProgress.time_spent,
          lastAccessed: updatedProgress.last_accessed_at,
          completedAt: updatedProgress.completed_at
        }
      }));
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  }, [user, progress]);

  return {
    progress,
    loading,
    error,
    updateProgress
  };
}