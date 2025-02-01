import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logError } from '../utils/errorHandling';

interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
}

interface ProgressUpdate {
  status?: 'not_started' | 'in_progress' | 'completed';
  progress?: number;
  completedAt?: string | null;
}

export function useLessonProgress(lessonId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user || loading) return;

      try {
        setLoading(true);
        setError(null);

        // Use upsert to handle initialization atomically
        const now = new Date().toISOString();
        const { data: progress, error: upsertError } = await supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              content_id: lessonId,
              status: 'not_started',
              progress: 0,
              last_accessed_at: now
            }, {
              onConflict: 'user_id,content_id',
              ignoreDuplicates: true
            })
            .select()
            .single();

        if (upsertError) throw upsertError;

        if (progress) {
          setProgress({
            lessonId,
            status: progress.status,
            progress: progress.progress,
            lastAccessedAt: progress.last_accessed_at,
            completedAt: progress.completed_at
          });
        }
      } catch (err) {
        logError(err as Error, {
          context: 'loadProgress',
          lessonId,
          userId: user.id,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
        setError('Failed to load lesson progress');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user?.id, lessonId, loading]);

  const updateProgress = async (update: ProgressUpdate) => {
    if (!user || !progress) return;

    const retryCount = 3;
    const retryDelay = 1000;

    try {
      const now = new Date().toISOString();

      // Retry loop for handling race conditions
      for (let attempt = 0; attempt < retryCount; attempt++) {
        try {
          // First get latest progress
          const { data: currentProgress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('content_id', lessonId)
            .maybeSingle();

          // If no changes needed, return early
          if (currentProgress &&
              currentProgress.status === update.status &&
              currentProgress.progress === update.progress) {
            return;
          }

          // Prepare update data
          const updateData = {
            user_id: user.id,
            content_id: lessonId,
            status: update.status || currentProgress?.status || progress.status,
            progress: update.progress ?? currentProgress?.progress ?? progress.progress,
            last_accessed_at: now,
            completed_at: update.status === 'completed' ? now : update.completedAt || currentProgress?.completed_at
          };

          // Use upsert with ON CONFLICT DO UPDATE
          const { data: updatedProgress, error } = await supabase
            .from('user_progress')
            .upsert(updateData, {
              onConflict: 'user_id,content_id',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (error) {
            // If it's a duplicate key error, retry
            if (error.code === '23505' && attempt < retryCount - 1) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              continue;
            }
            throw error;
          }

          // Update was successful
          if (updatedProgress) {
            setProgress({
              lessonId,
              status: updatedProgress.status,
              progress: updatedProgress.progress,
              lastAccessedAt: updatedProgress.last_accessed_at,
              completedAt: updatedProgress.completed_at
            });
          }

          // Success - break out of retry loop
          break;

        } catch (err) {
          // On last attempt, throw the error
          if (attempt === retryCount - 1) {
            throw err;
          }
          // Otherwise wait and retry
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

    } catch (err) {
      logError(err as Error, {
        context: 'updateProgress',
        lessonId,
        userId: user.id,
        update,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      throw err;
    }
  };

  return {
    progress,
    loading,
    error,
    updateProgress
  };
}