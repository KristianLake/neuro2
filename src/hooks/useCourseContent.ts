import { useState, useEffect } from 'react';
import { BaseContent, ContentMetadata } from '../components/course/types';

interface ContentCache {
  [key: string]: BaseContent;
}

export function useCourseContent(metadata?: ContentMetadata) {
  const [content, setContent] = useState<BaseContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple in-memory cache
  const cache = {} as ContentCache;

  useEffect(() => {
    if (!metadata) {
      setContent(null);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check cache first
        if (cache[metadata.id]) {
          setContent(cache[metadata.id]);
          return;
        }

        // Simulate API call to load content
        // In real implementation, this would fetch from your backend
        await new Promise(resolve => setTimeout(resolve, 500));

        const loadedContent: BaseContent = {
          metadata,
          content: "Sample content for " + metadata.title,
          accessibility: {
            altText: "Alternative text for content",
            transcripts: {
              en: "English transcript URL"
            }
          }
        };

        // Cache the content
        cache[metadata.id] = loadedContent;
        setContent(loadedContent);
      } catch (err) {
        console.error('Error loading content:', err);
        setError('Failed to load content. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [metadata?.id]);

  const clearCache = () => {
    Object.keys(cache).forEach(key => delete cache[key]);
  };

  return {
    content,
    loading,
    error,
    clearCache
  };
}