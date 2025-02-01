import { useTheme } from '../../../../contexts/ThemeContext';

interface LessonHeaderProps {
  title: string;
  subtitle: string;
  duration: number;
  objectives: string[];
}

export default function LessonHeader({ title, subtitle, duration, objectives }: LessonHeaderProps) {
  const { theme } = useTheme();

  return (
    <div className={`rounded-lg p-8 mb-8 ${
      theme === 'dark'
        ? `bg-gradient-to-r from-${themeConfig.colors.dark.background.card} to-${themeConfig.colors.dark.background.hover}`
        : theme === 'neurodivergent'
        ? `bg-gradient-to-r from-${themeConfig.colors.neurodivergent.background.card} to-${themeConfig.colors.neurodivergent.background.hover}`
        : `bg-gradient-to-r from-${themeConfig.colors.light.background.card} to-${themeConfig.colors.light.background.hover}`
    }`}>
      {/* Estimated Duration */}
      <div className={`mb-4 inline-flex items-center px-3 py-1 rounded-full text-sm ${
        theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.hover}/50 text-${themeConfig.colors.dark.text.secondary}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.hover}/50 text-${themeConfig.colors.neurodivergent.text.primary}`
          : `bg-${themeConfig.colors.light.primary.base}/10 text-${themeConfig.colors.light.primary.base}`
      }`}>
        <span className="mr-2">⏱️</span>
        Estimated time: {duration} minutes
      </div>

      {/* Title and Subtitle */}
      <h1 className={`text-3xl font-bold mb-4 ${
        theme === 'dark'
          ? `text-${themeConfig.colors.dark.text.primary}`
          : `text-${themeConfig.colors.light.text.primary}`
      }`}>
        {title}
      </h1>
      <p className={`text-lg mb-6 ${
        theme === 'dark'
          ? `text-${themeConfig.colors.dark.text.secondary}`
          : `text-${themeConfig.colors.light.text.secondary}`
      }`}>
        {subtitle}
      </p>

      {/* Learning Objectives */}
      <div className={`rounded-lg p-4 ${
        theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.hover}/50`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.card}`
          : `bg-${themeConfig.colors.light.background.card}/50`
      }`}>
        <h2 className={`text-lg font-semibold mb-3 ${
          theme === 'dark'
            ? `text-${themeConfig.colors.dark.text.primary}`
            : `text-${themeConfig.colors.light.text.primary}`
        }`}>
          In this lesson, you'll learn:
        </h2>
        <ul className={`space-y-2 ${
          theme === 'dark'
            ? `text-${themeConfig.colors.dark.text.secondary}`
            : `text-${themeConfig.colors.light.text.secondary}`
        }`}>
          {objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 mt-1">✦</span>
              {objective}
            </li>
          ))}
        </ul>
      </div>

      {/* Learning Style Options */}
      <div className={`mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 ${
        theme === 'dark'
          ? 'text-gray-300'
          : 'text-gray-600'
      }`}>
        <button className={`p-4 rounded-lg text-left transition-colors ${
          theme === 'dark'
            ? 'bg-gray-700/50 hover:bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50 hover:bg-amber-100'
            : 'bg-white/50 hover:bg-white'
        }`}>
          <span className="text-2xl mb-2 block">👀</span>
          <h3 className="font-medium mb-1">Visual Learning</h3>
          <p className="text-sm">Learn through diagrams and visual examples</p>
        </button>

        <button className={`p-4 rounded-lg text-left transition-colors ${
          theme === 'dark'
            ? 'bg-gray-700/50 hover:bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50 hover:bg-amber-100'
            : 'bg-white/50 hover:bg-white'
        }`}>
          <span className="text-2xl mb-2 block">👂</span>
          <h3 className="font-medium mb-1">Audio Learning</h3>
          <p className="text-sm">Listen to explanations and examples</p>
        </button>

        <button className={`p-4 rounded-lg text-left transition-colors ${
          theme === 'dark'
            ? 'bg-gray-700/50 hover:bg-gray-700'
            : theme === 'neurodivergent'
            ? 'bg-amber-50 hover:bg-amber-100'
            : 'bg-white/50 hover:bg-white'
        }`}>
          <span className="text-2xl mb-2 block">✍️</span>
          <h3 className="font-medium mb-1">Interactive Learning</h3>
          <p className="text-sm">Learn by doing with guided exercises</p>
        </button>
      </div>
    </div>
  );
}