import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AccessRule {
  id: string;
  contentId: string;
  ruleType: 'role' | 'module' | 'date';
  ruleValue: any;
  createdAt: string;
  updatedAt: string;
}

export function useContentAccess(contentId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get access rules
  const getAccessRules = useCallback(async (): Promise<AccessRule[]> => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);

      const { data, error: rulesError } = await supabase
        .from('content_access_rules')
        .select('*')
        .eq('content_id', contentId);

      if (rulesError) throw rulesError;

      return data;
    } catch (err) {
      console.error('Error getting access rules:', err);
      setError('Failed to get access rules');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  // Create access rule
  const createAccessRule = useCallback(async (
    ruleType: AccessRule['ruleType'],
    ruleValue: any
  ): Promise<AccessRule | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('content_access_rules')
        .insert([{
          content_id: contentId,
          rule_type: ruleType,
          rule_value: ruleValue
        }])
        .select()
        .single();

      if (createError) throw createError;

      return data;
    } catch (err) {
      console.error('Error creating access rule:', err);
      setError('Failed to create access rule');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  // Delete access rule
  const deleteAccessRule = useCallback(async (ruleId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('content_access_rules')
        .delete()
        .eq('id', ruleId);

      if (deleteError) throw deleteError;

      return true;
    } catch (err) {
      console.error('Error deleting access rule:', err);
      setError('Failed to delete access rule');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check content access
  const checkAccess = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      const { data, error: accessError } = await supabase
        .rpc('check_content_access', {
          p_content_id: contentId,
          p_user_id: user.id
        });

      if (accessError) throw accessError;

      return data;
    } catch (err) {
      console.error('Error checking content access:', err);
      setError('Failed to check content access');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  return {
    loading,
    error,
    getAccessRules,
    createAccessRule,
    deleteAccessRule,
    checkAccess
  };
}