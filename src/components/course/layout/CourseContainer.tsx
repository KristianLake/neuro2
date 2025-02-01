import { useTheme } from '../../../contexts/ThemeContext';
import { Course, BaseContent, ContentModule, ContentMetadata, Progress } from '../types';
import { CourseHeader } from './CourseHeader';
import { CourseLayout } from './CourseLayout';

interface CourseContainerProps {
  course: Course;
  currentModule?: ContentModule;
  currentContent?: ContentMetadata;
  content: BaseContent | null;
  progress: Record<string, Progress>;
  onModuleSelect: (moduleId: string) => void;
  onContentSelect: (contentId: string) => void;
  onContentComplete?: () => void;
  onProgressUpdate?: (progress: number) => void;
  onBack?: () => void;
}

export function CourseContainer({
  course,
  currentModule,
  currentContent,
  content,
  progress,
  onModuleSelect,
  onContentSelect,
  onContentComplete,
  onProgressUpdate,
  onBack
}: CourseContainerProps) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${
      theme === 'dark'
        ? 'bg-gray-900'
        : theme === 'neurodivergent'
        ? 'bg-amber-50'
        : 'bg-gray-50'
    }`}>
      <CourseHeader course={course} onBack={onBack} />
      <CourseLayout
        course={course}
        currentModule={currentModule}
        currentContent={currentContent}
        progress={progress}
        onModuleSelect={onModuleSelect}
        onContentSelect={onContentSelect}
        onContentComplete={onContentComplete}
        onProgressUpdate={onProgressUpdate}
      />
    </div>
  );
}