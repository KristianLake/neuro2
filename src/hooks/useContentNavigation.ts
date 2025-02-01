import { useState, useCallback } from 'react';
import { Course, ContentModule, ContentMetadata } from '../components/course/types';

interface NavigationState {
  currentModule?: ContentModule;
  currentContent?: ContentMetadata;
  previousContent?: ContentMetadata;
  nextContent?: ContentMetadata;
}

export function useContentNavigation(course: Course) {
  const [state, setState] = useState<NavigationState>({});

  const findAdjacentContent = useCallback((moduleId: string, contentId: string) => {
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return {};

    const module = course.modules[moduleIndex];
    const contentIndex = module.contents.findIndex(c => c.id === contentId);
    if (contentIndex === -1) return {};

    let previousContent: ContentMetadata | undefined;
    let nextContent: ContentMetadata | undefined;

    // Previous content
    if (contentIndex > 0) {
      previousContent = module.contents[contentIndex - 1];
    } else if (moduleIndex > 0) {
      const prevModule = course.modules[moduleIndex - 1];
      previousContent = prevModule.contents[prevModule.contents.length - 1];
    }

    // Next content
    if (contentIndex < module.contents.length - 1) {
      nextContent = module.contents[contentIndex + 1];
    } else if (moduleIndex < course.modules.length - 1) {
      const nextModule = course.modules[moduleIndex + 1];
      nextContent = nextModule.contents[0];
    }

    return { previousContent, nextContent };
  }, [course]);

  const navigateToContent = useCallback((moduleId: string, contentId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;

    const content = module.contents.find(c => c.id === contentId);
    if (!content) return;

    const { previousContent, nextContent } = findAdjacentContent(moduleId, contentId);

    setState({
      currentModule: module,
      currentContent: content,
      previousContent,
      nextContent
    });
  }, [course, findAdjacentContent]);

  const navigateToModule = useCallback((moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module || !module.contents.length) return;

    navigateToContent(moduleId, module.contents[0].id);
  }, [course, navigateToContent]);

  return {
    ...state,
    navigateToContent,
    navigateToModule
  };
}