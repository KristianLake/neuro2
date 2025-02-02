import { useState, useCallback } from 'react';
import { Course, ContentModule, ContentMetadata, Progress } from '../components/course/types';
import { useCourseAccess } from './useCourseAccess';

interface CourseState {
  currentModule?: ContentModule;
  currentContent?: ContentMetadata;
  progress: Record<string, Progress>;
}

export function useCourseState(course: Course) {
  const [state, setState] = useState<CourseState>({
    progress: {}
  });
  const { checkModuleAccess } = useCourseAccess();

  // Select module
  const handleModuleSelect = useCallback(async (moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    // Check access
    const hasAccess = await checkModuleAccess(moduleId);
    if (!hasAccess) {
      // Handle no access - could show purchase modal
      return;
    }

    setState(prev => ({
      ...prev,
      currentModule: module,
      currentContent: module.contents[0]
    }));
  }, [course.modules, checkModuleAccess]);

  // Select content
  const handleContentSelect = useCallback(async (contentId: string) => {
    const module = course.modules.find(m => 
      m.contents.some(c => c.id === contentId)
    );
    if (!module) return;

    // Check access
    const hasAccess = await checkModuleAccess(module.id);
    if (!hasAccess) {
      // Handle no access
      return;
    }

    const content = module.contents.find(c => c.id === contentId);
    if (!content) return;

    setState(prev => ({
      ...prev,
      currentModule: module,
      currentContent: content
    }));

    // Update progress
    updateProgress(contentId, {
      status: 'in_progress',
      progress: prev.progress[contentId]?.progress || 0
    });
  }, [course.modules, checkModuleAccess]);

  // Update progress
  const updateProgress = useCallback((contentId: string, update: Partial<Progress>) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        [contentId]: {
          ...prev.progress[contentId],
          contentId,
          userId: 'current-user', // Replace with actual user ID
          status: 'in_progress',
          ...update,
          lastAccessed: new Date().toISOString()
        }
      }
    }));
  }, []);

  // Handle content completion
  const handleContentComplete = useCallback(() => {
    if (!state.currentContent) return;

    updateProgress(state.currentContent.id, {
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    });

    // Auto-advance to next content
    const currentModule = state.currentModule;
    if (!currentModule) return;

    const currentIndex = currentModule.contents.findIndex(
      c => c.id === state.currentContent?.id
    );

    if (currentIndex < currentModule.contents.length - 1) {
      // Next content in same module
      handleContentSelect(currentModule.contents[currentIndex + 1].id);
    } else {
      // Find next module
      const moduleIndex = course.modules.findIndex(m => m.id === currentModule.id);
      if (moduleIndex < course.modules.length - 1) {
        const nextModule = course.modules[moduleIndex + 1];
        handleModuleSelect(nextModule.id);
      }
    }
  }, [state.currentContent, state.currentModule, course.modules, handleContentSelect, handleModuleSelect]);

  // Handle progress update
  const handleProgressUpdate = useCallback((progress: number) => {
    if (!state.currentContent) return;
    updateProgress(state.currentContent.id, { progress });
  }, [state.currentContent, updateProgress]);

  return {
    ...state,
    handleModuleSelect,
    handleContentSelect,
    handleContentComplete,
    handleProgressUpdate
  };
}