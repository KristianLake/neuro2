import { useAchievements } from '../../../../hooks/useAchievements';
import { useTheme } from '../../../../contexts/ThemeContext';

export default function XPCounter() {
  const { totalXp } = useAchievements();
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`rounded-lg shadow-lg p-4 ${
        theme === 'dark'
          ? 'bg-gray-800 border border-gray-700'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50 border border-amber-200'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⭐</span>
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Total XP: {totalXp}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}