import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ContentVersion {
  version: number;
  data: any;
  diff?: any;
  createdBy: string;
  createdAt: string;
}

export function useContentVersioning(contentId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get version history
  const getVersionHistory = useCallback(async (
    limit: number = 10,
    offset: number = 0
  ): Promise<ContentVersion[]> => {
    if (!user) return [];

    try {
      setLoading(true);
      setError(null);

      const { data, error: historyError } = await supabase
        .rpc('get_content_version_history', {
          p_content_id: contentId,
          p_limit: limit,
          p_offset: offset
        });

      if (historyError) throw historyError;

      return data.map(version => ({
        version: version.version,
        data: version.data,
        diff: version.diff,
        createdBy: version.created_by,
        createdAt: version.created_at
      }));
    } catch (err) {
      console.error('Error getting version history:', err);
      setError('Failed to get version history');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, contentId]);

  // Create new version
  const createVersion = useCallback(async (
    data: any,
    previousVersion?: number
  ) => {
    if (!user) return null;

    try {
      setLoading(true);
      setError(null);

      // Get current version if not provided
      if (!previousVersion) {
        const versions = await getVersionHistory(1);
        previousVersion = versions[0]?.version || 0;
      }

      // Calculate diff if previous version exists
      let diff;
      if (previousVersion > 0) {
        const { data: prevVersion } = await supabase
          .from('content_versions')
          .select('data')
          .eq('content_id', contentId)
          .eq('version', previousVersion)
          .single();

        if (prevVersion) {
          // Simple diff calculation - in real app use proper diff algorithm
          diff = {
            added: Object.keys(data).filter(key => !prevVersion.data[key]),
            removed: Object.keys(prevVersion.data).filter(key => !data[key]),
            modified: Object.keys(data).filter(key => 
              prevVersion.data[key] && data[key] !== prevVersion.data[key]
            )
          };
        }
      }

      const { data: newVersion, error: createError } = await supabase
        .from('content_versions')
        .insert([{
          content_id: contentId,
          version: previousVersion + 1,
          data,
          diff,
          created_by: user.id
        }])
        .select()
        .single();

      if (createError) throw createError;

      return newVersion;
    } catch (err) {
      console.error('Error creating version:', err);
      setError('Failed to create version');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, contentId, getVersionHistory]);

  return {
    loading,
    error,
    getVersionHistory,
    createVersion
  };
}