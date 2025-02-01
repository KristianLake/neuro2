import { useState, useMemo } from 'react';
import { useAchievements } from '../../hooks/useAchievements';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AchievementList from '../../components/AchievementList';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Gamification() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { earnedAchievements, availableAchievements, totalXp, allAchievements, resetAchievements } = useAchievements();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const isDev = process.env.NODE_ENV === 'development';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const ITEMS_PER_PAGE = 10;
  
  // Add development section for progress management
  const handleResetProgress = async () => {
    if (!user) return;
    
    try {
      // Delete all progress and achievements for the user
      const [progressResult, achievementsResult] = await Promise.all([
        // Delete progress records
        supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id),
        // Delete achievements
        supabase
          .from('user_achievements')
          .delete()
          .eq('user_id', user.id)
      ]);
      if (progressResult.error) throw progressResult.error;
      if (achievementsResult.error) throw achievementsResult.error;

      // Reset achievements in store
      await resetAchievements(user.id);

      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('lesson-')) {
          localStorage.removeItem(key);
        }
      });

      // Show success message
      alert('Progress and achievements reset successfully');
    } catch (error) {
      console.error('Error resetting progress:', error);
      alert('Failed to reset progress and achievements');
    }
  };
  
  const level = Math.floor(totalXp / 100) + 1;
  const nextLevelXp = level * 100;

  // Get unique categories from achievements
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    allAchievements.forEach(achievement => {
      if (achievement.lessonPath) {
        const category = achievement.lessonPath === '/lessons/introduction'
          ? 'Introduction'
          : achievement.lessonPath === '/learn/comments'
          ? 'Comments'
          : 'Other';
        categorySet.add(category);
      }
    });
    return ['all', ...Array.from(categorySet)];
  }, [allAchievements]);

  // Filter and search achievements
  const filteredAchievements = useMemo(() => {
    let filtered = earnedAchievements;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => {
        if (achievement.lessonPath === '/lessons/introduction') {
          return selectedCategory === 'Introduction';
        } else if (achievement.lessonPath === '/learn/comments') {
          return selectedCategory === 'Comments';
        }
        return selectedCategory === 'Other';
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(achievement =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [earnedAchievements, selectedCategory, searchQuery]);

  // Filter available achievements
  const filteredAvailableAchievements = useMemo(() => {
    let filtered = availableAchievements;
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(achievement => {
        if (achievement.lessonPath === '/lessons/introduction') {
          return selectedCategory === 'Introduction';
        } else if (achievement.lessonPath === '/learn/comments') {
          return selectedCategory === 'Comments';
        }
        return selectedCategory === 'Other';
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(achievement =>
        achievement.title.toLowerCase().includes(query) ||
        achievement.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [availableAchievements, selectedCategory, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(
    (filteredAchievements.length + filteredAvailableAchievements.length) / ITEMS_PER_PAGE
  );
  
  const paginatedEarned = filteredAchievements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const paginatedAvailable = filteredAvailableAchievements.slice(
    Math.max(0, (currentPage - 1) * ITEMS_PER_PAGE - filteredAchievements.length),
    Math.max(0, currentPage * ITEMS_PER_PAGE - filteredAchievements.length)
  );

  return (
    <div className="space-y-8">
      {/* Development Reset Button */}
      {isDev && (
        <div className={`rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-red-900/20 border border-red-800'
            : theme === 'neurodivergent'
            ? 'bg-red-50 border border-red-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-medium ${
                theme === 'dark' ? 'text-red-300' : 'text-red-800'
              }`}>Development Tools</h3>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>These tools are only available in development mode</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={handleResetProgress}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'dark'
                    ? 'bg-yellow-500 hover:bg-yellow-400 focus:ring-yellow-400'
                    : theme === 'neurodivergent'
                    ? 'bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-500'
                    : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                }`}
              >
                Reset Progress
              </button>
              <button
                onClick={async () => {
                  if (user) {
                    try {
                      // Delete achievements from database
                      const { error } = await supabase
                        .from('user_achievements')
                        .delete()
                        .eq('user_id', user.id);

                      if (error) throw error;

                      // Reset achievements in store
                      await resetAchievements(user.id);
                      alert('Achievements reset successfully');
                    } catch (error) {
                      console.error('Error resetting achievements:', error);
                      alert('Failed to reset achievements');
                    }
                  }
                }}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  theme === 'dark'
                    ? 'bg-red-500 hover:bg-red-400 focus:ring-red-400'
                    : theme === 'neurodivergent'
                    ? 'bg-red-600 hover:bg-red-500 focus:ring-red-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                Reset All Achievements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      <div className={`shadow sm:rounded-lg overflow-hidden ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Level {level}</h2>
            <div className="text-3xl">👑</div>
          </div>
          
          <div className={`flex items-center justify-between text-sm mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>{totalXp} XP</span>
            <span>{nextLevelXp} XP</span>
          </div>
          
          <div className={`w-full rounded-full h-2.5 ${
            theme === 'dark'
              ? 'bg-gray-700'
              : theme === 'neurodivergent'
              ? 'bg-amber-200'
              : 'bg-gray-200'
          }`}>
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                theme === 'dark'
                  ? 'bg-indigo-500'
                  : theme === 'neurodivergent'
                  ? 'bg-teal-600'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${(totalXp % 100) / 100 * 100}%` }}
            ></div>
          </div>
          
          <p className={`mt-2 text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {nextLevelXp - totalXp} XP needed for next level
          </p>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className={`shadow sm:rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="px-4 py-5 sm:p-6">
          <h2 className={`text-lg font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Achievement Progress</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className={`rounded-lg p-4 ${
              theme === 'dark'
                ? 'bg-indigo-900/20'
                : theme === 'neurodivergent'
                ? 'bg-teal-50'
                : 'bg-indigo-50'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                theme === 'dark'
                  ? 'text-indigo-400'
                  : theme === 'neurodivergent'
                  ? 'text-teal-600'
                  : 'text-indigo-600'
              }`}>
                {earnedAchievements.length}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Achievements Earned</div>
            </div>
            <div className={`rounded-lg p-4 ${
              theme === 'dark'
                ? 'bg-indigo-900/20'
                : theme === 'neurodivergent'
                ? 'bg-teal-50'
                : 'bg-indigo-50'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                theme === 'dark'
                  ? 'text-indigo-400'
                  : theme === 'neurodivergent'
                  ? 'text-teal-600'
                  : 'text-indigo-600'
              }`}>
                {totalXp}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Total XP</div>
            </div>
            <div className={`rounded-lg p-4 ${
              theme === 'dark'
                ? 'bg-indigo-900/20'
                : theme === 'neurodivergent'
                ? 'bg-teal-50'
                : 'bg-indigo-50'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                theme === 'dark'
                  ? 'text-indigo-400'
                  : theme === 'neurodivergent'
                  ? 'text-teal-600'
                  : 'text-indigo-600'
              }`}>
                {Math.round((earnedAchievements.length / allAchievements.length) * 100)}%
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className={`shadow sm:rounded-lg overflow-hidden ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} aria-hidden="true" />
              </div>
              <input
                type="text"
                className={`block w-full rounded-md border-0 py-1.5 pl-10 ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white ring-gray-600 placeholder:text-gray-400 focus:ring-indigo-500'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50 text-gray-900 ring-amber-200 placeholder:text-gray-400 focus:ring-teal-600'
                    : 'bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
                }`}
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white ring-gray-600 focus:ring-indigo-500'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50 text-gray-900 ring-amber-200 focus:ring-teal-600'
                    : 'bg-white text-gray-900 ring-gray-300 focus:ring-indigo-600'
                }`}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <AchievementList
            earnedAchievements={paginatedEarned}
            availableAchievements={paginatedAvailable}
            showViewAll={false}
            showSource={true}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredAchievements.length + filteredAvailableAchievements.length)}
                    </span> of{' '}
                    <span className="font-medium">{filteredAchievements.length + filteredAvailableAchievements.length}</span> achievements
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          page === currentPage
                            ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}