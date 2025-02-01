import { useTheme } from '../../contexts/ThemeContext';
import { ContentType, BaseContent } from './types';
import { ContentErrorBoundary } from '../error';
import { TextContent } from './content/TextContent';
import { VideoContent } from './content/VideoContent';
import { QuizContent } from './content/QuizContent';
import { AssignmentContent } from './content/AssignmentContent';
import { InteractiveContent } from './content/InteractiveContent';
import { CodeContent } from './content/CodeContent';

interface ContentRendererProps {
  content: BaseContent;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

export function ContentRenderer({ content, onComplete, onProgress }: ContentRendererProps) {
  const { theme } = useTheme();

  const renderContent = () => {
    switch (content.metadata.type) {
      case 'text':
        return <TextContent content={content} onComplete={onComplete} onProgress={onProgress} />;
      case 'video':
        return <VideoContent content={content} onProgress={onProgress} onComplete={onComplete} />;
      case 'quiz':
        return <QuizContent content={content} onComplete={onComplete} onProgress={onProgress} />;
      case 'assignment':
        return <AssignmentContent content={content} onComplete={onComplete} onProgress={onProgress} />;
      case 'interactive':
        return <InteractiveContent content={content} onProgress={onProgress} onComplete={onComplete} />;
      case 'code':
        return <CodeContent content={content} onComplete={onComplete} onProgress={onProgress} />;
      default:
        return <div>Unsupported content type</div>;
    }
  };

  return (
    <div className={`rounded-lg shadow-sm ${
      theme === 'dark'
        ? 'bg-gray-800'
        : theme === 'neurodivergent'
        ? 'bg-amber-100/50'
        : 'bg-white'
    }`}>
      <div className="p-6">
        <h2 className={`text-xl font-bold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {content.metadata.title}
        </h2>
        {content.metadata.description && (
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {content.metadata.description}
          </p>
        )}
        <ContentErrorBoundary contentId={content.metadata.id} onRetry={onComplete}>
          {renderContent()}
        </ContentErrorBoundary>
      </div>
    </div>
  );
}