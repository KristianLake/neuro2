import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BaseContent, ContentType } from '../types';
import { BaseCard, BaseAlert } from '../../base';
import { ContentRenderer } from '../ContentRenderer';
import { useLessonProgress } from '../../../hooks/useLessonProgress'; 

interface LessonContentProps {
  content: BaseContent;
  onComplete?: () => void;
}

export function LessonContent({ content, onComplete }: LessonContentProps) {
  const { theme } = useTheme();
  const { progress, loading, error, updateProgress } = useLessonProgress(content.metadata.id);
  const [breakTimer, setBreakTimer] = useState<number | null>(null);
  const [shouldPreventScroll, setShouldPreventScroll] = useState(true);

  // Track content progress with useCallback
  const handleProgressUpdate = useCallback((newProgress: number) => {
    if (!loading && progress) {
      updateProgress({
        status: newProgress >= 100 ? 'completed' : 'in_progress',
        progress: newProgress
      });
    }
  }, [loading, progress, updateProgress]);

  // Handle completion
  const handleComplete = useCallback(() => {
    updateProgress({
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });
    if (onComplete) {
      onComplete();
    }
  }, [updateProgress, onComplete]);

  // Initialize progress when starting lesson
  useEffect(() => {
    if (!loading && progress?.status === 'not_started') {
      updateProgress({
        status: 'in_progress',
        progress: 0
      });
    }
  }, [loading, progress?.status, updateProgress]);

  // Add break reminders
  useEffect(() => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Request permission if needed
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // Set up break timer
    const timer = window.setInterval(() => {
      // Show break reminder every 20 minutes
      if (Notification.permission === "granted") {
        new Notification('Time for a Break!', {
          body: 'Take a 5-minute break to rest your eyes and stretch.',
          icon: '/logo.svg'
        });
      }
    }, 20 * 60 * 1000);

    setBreakTimer(timer);

    return () => {
      if (breakTimer) {
        window.clearInterval(breakTimer);
      }
    };
  }, []);
  // Prevent initial scroll
  useEffect(() => {
    if (shouldPreventScroll) {
      window.scrollTo(0, 0);
      setShouldPreventScroll(false);
    }
  }, [shouldPreventScroll]);

  return (
    <BaseCard>
      {error && (
        <BaseAlert
          type="error"
          title="Error"
          message="Failed to load lesson progress. Your progress may not be saved."
        />
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className={`h-2 rounded-full ${
          theme === 'dark'
            ? 'bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-200'
            : 'bg-gray-200'
        }`}>
          <div
            className={`h-full rounded-full transition-all ${
              theme === 'dark'
                ? 'bg-indigo-500'
                : theme === 'neurodivergent'
                ? 'bg-teal-600'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${loading ? 0 : progress?.progress || 0}%` }}
          />
        </div>
        <p className={`mt-1 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Progress: {progress?.progress || 0}%
        </p>
      </div>

      {/* Content Title */}
      <h1 className={`text-3xl font-bold mb-6 ${
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      }`}>
        {content.metadata.title}
      </h1>

      {/* Content Description */}
      {content.metadata.description && (
        <p className={`text-lg mb-8 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {content.metadata.description}
        </p>
      )}

      {/* Main Content */}
      <div className="space-y-12">
        {React.Children.map(content.content, (child) => {
          if (!React.isValidElement(child)) return child;
          
          const contentType = child.props['data-content-type'];
          let sectionStyles = '';
          
          switch (contentType) {
            case ContentType.Theory:
              sectionStyles = theme === 'dark'
                ? 'bg-gray-700/50 border border-gray-600'
                : theme === 'neurodivergent'
                ? 'bg-amber-50 border border-amber-200'
                : 'bg-gray-50 border border-gray-200';
              break;
            case ContentType.Practice:
              sectionStyles = theme === 'dark'
                ? 'bg-indigo-900/20 border border-indigo-800'
                : theme === 'neurodivergent'
                ? 'bg-teal-50 border border-teal-200'
                : 'bg-indigo-50 border border-indigo-200';
              break;
            case ContentType.Reference:
              sectionStyles = theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700'
                : theme === 'neurodivergent'
                ? 'bg-amber-100/50 border border-amber-300'
                : 'bg-white border border-gray-300';
              break;
            default:
              sectionStyles = '';
          }
          
          return (
            <div className={`rounded-lg p-6 ${sectionStyles}`}>
              {/* Section Type Label */}
              <div className={`mb-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-300'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-200 text-gray-900'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {contentType}
              </div>
              {child}
            </div>
          );
        })}
      </div>

      {/* Break Timer */}
      <div className={`mt-4 p-3 rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-50'
          : 'bg-gray-50'
      }`}>
        <div className="flex items-center">
          <span className="text-xl mr-2">⏰</span>
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Next break in: 15:00
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Remember to take regular breaks to stay focused
            </p>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}