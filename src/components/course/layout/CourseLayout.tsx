import { useTheme } from '../../../contexts/ThemeContext';
import { Course, ContentModule, ContentMetadata, Progress } from '../types';
import { CourseNavigation, ContentNavigation, ModuleProgress } from '../navigation';
import { ContentRenderer } from '../ContentRenderer';

interface CourseLayoutProps {
  course: Course;
  currentModule?: ContentModule;
  currentContent?: ContentMetadata;
  progress: Record<string, Progress>;
  onModuleSelect: (moduleId: string) => void;
  onContentSelect: (contentId: string) => void;
  onContentComplete?: () => void;
  onProgressUpdate?: (progress: number) => void;
}

export function CourseLayout({
  course,
  currentModule,
  currentContent,
  progress,
  onModuleSelect,
  onContentSelect,
  onContentComplete,
  onProgressUpdate
}: CourseLayoutProps) {
  const { theme } = useTheme();

  // Find previous and next content
  const findAdjacentContent = () => {
    if (!currentModule || !currentContent) return {};

    const moduleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const contentIndex = currentModule.contents.findIndex(c => c.id === currentContent.id);

    let previousContent: ContentMetadata | undefined;
    let nextContent: ContentMetadata | undefined;

    // Previous content
    if (contentIndex > 0) {
      previousContent = currentModule.contents[contentIndex - 1];
    } else if (moduleIndex > 0) {
      const prevModule = course.modules[moduleIndex - 1];
      previousContent = prevModule.contents[prevModule.contents.length - 1];
    }

    // Next content
    if (contentIndex < currentModule.contents.length - 1) {
      nextContent = currentModule.contents[contentIndex + 1];
    } else if (moduleIndex < course.modules.length - 1) {
      const nextModule = course.modules[moduleIndex + 1];
      nextContent = nextModule.contents[0];
    }

    return { previousContent, nextContent };
  };

  const { previousContent, nextContent } = findAdjacentContent();

  return (
    <div className="min-h-screen flex">
      {/* Course Navigation */}
      <CourseNavigation
        course={course}
        currentModuleId={currentModule?.id}
        currentContentId={currentContent?.id}
        onModuleSelect={onModuleSelect}
        onContentSelect={onContentSelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Content */}
              <div className="flex-1">
                {currentContent && (
                  <ContentRenderer
                    content={{
                      metadata: currentContent,
                      content: "Content goes here" // Replace with actual content
                    }}
                    onComplete={onContentComplete}
                    onProgress={onProgressUpdate}
                  />
                )}
              </div>

              {/* Progress Sidebar */}
              <div className="w-80 flex-shrink-0">
                {currentModule && (
                  <ModuleProgress
                    module={currentModule}
                    progress={progress}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Navigation */}
        <ContentNavigation
          previousContent={previousContent}
          nextContent={nextContent}
          onNavigate={onContentSelect}
          progress={currentContent ? (progress[currentContent.id]?.progress || 0) : 0}
        />
      </div>
    </div>
  );
}