import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface StepProgress {
  currentStep: number;
  completed: string[];
  showPractice: boolean;
  showSteps: boolean;
}

export function useInteractiveProgress(contentId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<StepProgress>({
    currentStep: 0,
    completed: [],
    showPractice: false,
    showSteps: true
  });

  // Initialize progress in database if it doesn't exist
  useEffect(() => {
    const initializeProgress = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);

        const { data, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .maybeSingle();

        // Handle PGRST116 error (no rows) by creating initial record
        if (progressError?.code === 'PGRST116' || !data) {
          // Create initial progress record
          const { error: upsertError } = await supabase
            .from('user_progress')
            .upsert({
              user_id: user.id,
              content_id: contentId,
              status: 'not_started',
              progress: 0,
              details: {
                stepProgress: progress
              },
              last_accessed_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,content_id',
              ignoreDuplicates: false
            });

          if (upsertError) {
            console.error('Error creating initial progress:', upsertError);
            setError('Failed to initialize progress');
          }
        } else if (progressError) {
          throw progressError;
        }

        // Update progress from existing data
        if (data && data.details?.stepProgress) {
          setProgress(data.details.stepProgress);
        }
      } catch (err) {
        console.error('Error initializing progress:', err);
        setError('Failed to initialize progress');
      } finally {
        setLoading(false);
      }
    };

    initializeProgress();
  }, [user, contentId]);

  // Save progress to database
  const saveProgress = async (newProgress: Partial<StepProgress>) => {
    if (!user) return;

    const updatedProgress = { ...progress, ...newProgress };
    setProgress(updatedProgress);

    try {
      const { error: upsertError } = await supabase
        .from('user_progress')
        .upsert(
        {
          user_id: user.id,
          content_id: contentId,
          status: updatedProgress.showPractice ? 'in_progress' : 'not_started',
          progress: (updatedProgress.completed.length / 3) * 100, // Assuming 3 steps total
          details: {
            stepProgress: updatedProgress
          },
          last_accessed_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id,content_id',
          ignoreDuplicates: false
        });

      if (upsertError) throw upsertError;
    } catch (err) {
      console.error('Error saving progress:', err);
      setError('Failed to save progress');
    }
  };

  // Reset progress
  const resetProgress = async () => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id)
        .eq('content_id', contentId);

      if (deleteError) throw deleteError;

      setProgress({
        currentStep: 0,
        completed: [],
        showPractice: false,
        showSteps: true
      });
    } catch (err) {
      console.error('Error resetting progress:', err);
      setError('Failed to reset progress');
    }
  };

  return {
    progress,
    loading,
    error,
    saveProgress,
    resetProgress
  };
}