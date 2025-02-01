import { useTheme } from '../../../contexts/ThemeContext';
import { ContentModule } from '../types';
import { BaseCard, BaseButton } from '../../base';

interface ModuleContentProps {
  module: ContentModule;
  onContentSelect: (contentId: string) => void;
}

export function ModuleContent({ module, onContentSelect }: ModuleContentProps) {
  const { theme } = useTheme();

  return (
    <BaseCard>
      <div className="space-y-6">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {module.title}
          </h1>
          {module.description && (
            <p className={`${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {module.description}
            </p>
          )}
        </div>

        {/* Module Objectives */}
        {module.objectives && (
          <div className={`p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-50'
              : 'bg-gray-50'
          }`}>
            <h2 className={`text-lg font-medium mb-3 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Learning Objectives
            </h2>
            <ul className={`list-disc pl-5 space-y-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {module.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Module Contents */}
        <div>
          <h2 className={`text-lg font-medium mb-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Module Contents
          </h2>
          <div className="space-y-2">
            {module.contents.map((content, index) => (
              <button
                key={content.id}
                onClick={() => onContentSelect(content.id)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Lesson {index + 1}
                    </span>
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {content.title}
                    </h3>
                    {content.description && (
                      <p className={`text-sm mt-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {content.description}
                      </p>
                    )}
                  </div>
                  <div className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {content.estimatedTime} min
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Module Button */}
        <div className="flex justify-center">
          <BaseButton
            variant="primary"
            onClick={() => onContentSelect(module.contents[0].id)}
          >
            Start Module
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  );
}