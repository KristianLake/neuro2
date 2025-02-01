import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useCallback } from 'react';
import { rateLimit } from '../middleware/rateLimit';

export function useCourseAccess() {
  const { user } = useAuth();

  const checkModuleAccess = useCallback(async (moduleId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First lesson of Module 1 is always free
      if (moduleId === 'module-1' && window.location.pathname === '/lessons/introduction') {
        return true;
      }

      // Rate limit check
      const { success, error } = await rateLimit('api')(user.id);
      if (!success) {
        throw new Error(error);
      }

      const { data, error: accessError } = await supabase
        .from('course_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .maybeSingle()
        .throwOnError();

      if (accessError) {
        console.error('Error checking module access:', accessError);
        return false;
      }

      // Check if access exists and hasn't expired
      if (data) {
        if (!data.expires_at) return true;
        return new Date(data.expires_at) > new Date();
      }

      return false;
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof Error && error.message === 'Failed to fetch') {
        console.error('Network error checking module access:', error);
        // Return true for free lesson when offline
        return moduleId === 'module-1' && window.location.pathname === '/lessons/introduction';
      }
      
      console.error('Error checking module access:', error); 
      return false;
    }
  }, [user]);

  const getUserModules = useCallback(async () => {
    if (!user) return [];

    // Return free modules when offline
    const freeModules = ['module-1', 'module-1-intro'];

    try {
      const { data, error } = await supabase
        .from('course_access')
        .select('module_id, expires_at')
        .eq('user_id', user.id);

      if (error) {
        // Return free modules on error
        return freeModules.map(moduleId => ({
          module_id: moduleId,
          expires_at: null
        }));
      }

      // Filter out expired access
      return data.filter(access => {
        if (!access.expires_at) return true;
        return new Date(access.expires_at) > new Date();
      });
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof Error && error.message === 'Failed to fetch') {
        console.error('Network error getting user modules:', error);
        // Return free modules when offline
        return freeModules.map(moduleId => ({
          module_id: moduleId,
          expires_at: null
        }));
      }

      console.error('Error fetching user modules:', error);
      return freeModules.map(moduleId => ({
        module_id: moduleId,
        expires_at: null
      }));
    }
  }, [user]);

  return {
    checkModuleAccess,
    getUserModules
  };
}