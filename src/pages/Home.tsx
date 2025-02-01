import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { themeConfig } from '../config/theme';

export default function Home() {
  const { theme } = useTheme();

  return (
    <div className={`bg-${themeConfig.colors[theme].background.main}`}>
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className={`text-4xl font-bold tracking-tight sm:text-6xl ${
              theme === 'dark'
                ? `text-${themeConfig.colors.dark.text.primary}`
                : `text-${themeConfig.colors.light.text.primary}`
            }`}>
              Learn Web Development Your Way
            </h1>
            <p className={`mt-6 text-lg leading-8 ${
              theme === 'dark'
                ? `text-${themeConfig.colors.dark.text.secondary}`
                : `text-${themeConfig.colors.light.text.secondary}`
            }`}>
              A neurodivergent-friendly approach to mastering web development. Build real-world projects and launch your career in tech.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/courses"
                className={`rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  theme === 'dark'
                    ? `bg-${themeConfig.colors.dark.primary.base} text-${themeConfig.colors.dark.primary.text} hover:bg-${themeConfig.colors.dark.primary.hover} focus-visible:outline-${themeConfig.colors.dark.primary.focus}`
                    : theme === 'neurodivergent'
                    ? `bg-${themeConfig.colors.neurodivergent.primary.base} text-${themeConfig.colors.neurodivergent.primary.text} hover:bg-${themeConfig.colors.neurodivergent.primary.hover} focus-visible:outline-${themeConfig.colors.neurodivergent.primary.focus}`
                    : `bg-${themeConfig.colors.light.primary.base} text-${themeConfig.colors.light.primary.text} hover:bg-${themeConfig.colors.light.primary.hover} focus-visible:outline-${themeConfig.colors.light.primary.focus}`
                }`}
              >
                View Courses
              </Link>
              <a
                href="#learn-more"
                className={`text-sm font-semibold leading-6 ${
                  theme === 'dark'
                    ? `text-${themeConfig.colors.dark.text.secondary}`
                    : `text-${themeConfig.colors.light.text.primary}`
                }`}
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}