import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ModuleProgress {
  moduleId: string;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
}

export function useModuleProgress(moduleId: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ModuleProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Get module progress
        const { data, error: progressError } = await supabase
          .from('module_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_id', moduleId)
          .single();

        if (progressError && progressError.code !== 'PGRST116') { // PGRST116 = no rows
          throw progressError;
        }

        // Get total lessons for module
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('total_lessons')
          .eq('id', moduleId)
          .single();

        if (moduleError) throw moduleError;

        setProgress({
          moduleId,
          completedLessons: data?.completed_lessons || 0,
          totalLessons: moduleData.total_lessons,
          lastAccessedAt: data?.last_accessed_at || null,
          completedAt: data?.completed_at || null
        });
      } catch (err) {
        console.error('Error loading module progress:', err);
        setError('Failed to load module progress');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user, moduleId]);

  const updateProgress = async (completedLessons: number) => {
    if (!user || !progress) return;

    try {
      const isComplete = completedLessons === progress.totalLessons;
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('module_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          completed_lessons: completedLessons,
          last_accessed_at: now,
          completed_at: isComplete ? now : null
        });

      if (error) throw error;

      setProgress(prev => prev ? {
        ...prev,
        completedLessons,
        lastAccessedAt: now,
        completedAt: isComplete ? now : null
      } : null);
    } catch (err) {
      console.error('Error updating module progress:', err);
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