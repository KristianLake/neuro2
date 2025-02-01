import { useTheme } from '../../../contexts/ThemeContext';
import { BaseContent } from '../types';

interface TextContentProps {
  content: BaseContent;
  onComplete?: () => void;
}

export function TextContent({ content, onComplete }: TextContentProps) {
  const { theme } = useTheme();

  // Track reading progress
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const progress = (element.scrollTop + element.clientHeight) / element.scrollHeight;
    
    // Mark as complete when user reaches bottom
    if (progress > 0.9 && onComplete) {
      onComplete();
    }
  };

  return (
    <div 
      className={`prose max-w-none ${
        theme === 'dark'
          ? 'prose-invert'
          : theme === 'neurodivergent'
          ? 'prose-amber'
          : 'prose-gray'
      }`}
      onScroll={handleScroll}
    >
      {content.content}
    </div>
  );
}