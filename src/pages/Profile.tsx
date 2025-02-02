import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Gamification from './profile/Gamification';
import ThemeSelector from '../components/ThemeSelector';
import FontSelector from '../components/FontSelector';
import LineSpacingSelector from '../components/LineSpacingSelector';
import ReadingGuideSelector from '../components/ReadingGuideSelector';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { usePurchases } from '../hooks/usePurchases';
import { supabase } from '../lib/supabase';
import { PageLayout } from '../components/layouts';
import { BaseCard } from '../components/base';
import { themeConfig } from '../config/theme';

type TabType = 'settings' | 'gamification' | 'appearance' | 'accessibility' | 'purchases';

export default function Profile() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { getUserPurchases } = usePurchases();

  const searchParams = new URLSearchParams(location.search);
  const initialTab = (searchParams.get('tab') as TabType) || 'settings';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [courseAccess, setCourseAccess] = useState<
    Array<{ module_id: string; expires_at: string | null }>
  >([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  // Fetch purchases and course access
  useEffect(() => {
    const fetchPurchasesAndAccess = async () => {
      if (!user) {
        return;
      }

      try {
        const userPurchases = await getUserPurchases();
        setPurchases(userPurchases);

        const { data: access } = await supabase
          .from('course_access')
          .select('*')
          .eq('user_id', user.id);

        setCourseAccess(access || []);
      } catch (error) {
        console.error('Error fetching purchases or access:', error);
      } finally {
        setLoadingPurchases(false);
      }
    };

    fetchPurchasesAndAccess();
  }, [user?.id]);

  // Sync URL with active tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/profile?tab=${tab}`, { replace: true });
  };

  // Update tab from URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setError('');
      setMessage('');
      setLoading(true);

      await updateProfile({ full_name: fullName });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'settings', label: 'Settings' },
    { id: 'gamification', label: 'Achievements & XP' },
    { id: 'purchases', label: 'My Purchases' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'accessibility', label: 'Accessibility' },
  ];

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Tabs */}
        <div
          className={`border-b mb-8 ${
            theme === 'dark'
              ? `border-${themeConfig.colors.dark.border.base}`
              : theme === 'neurodivergent'
              ? `border-${themeConfig.colors.neurodivergent.border.base}`
              : `border-${themeConfig.colors.light.border.base}`
          }`}
        >
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? `border-${themeConfig.colors.dark.primary.base} text-${themeConfig.colors.dark.primary.base}`
                      : theme === 'neurodivergent'
                      ? `border-${themeConfig.colors.neurodivergent.primary.base} text-${themeConfig.colors.neurodivergent.primary.base}`
                      : `border-${themeConfig.colors.light.primary.base} text-${themeConfig.colors.light.primary.base}`
                    : theme === 'dark'
                    ? `border-transparent text-${themeConfig.colors.dark.text.muted} hover:text-${themeConfig.colors.dark.text.secondary} hover:border-${themeConfig.colors.dark.border.hover}`
                    : theme === 'neurodivergent'
                    ? `border-transparent text-${themeConfig.colors.neurodivergent.text.secondary} hover:text-${themeConfig.colors.neurodivergent.text.primary} hover:border-${themeConfig.colors.neurodivergent.border.hover}`
                    : `border-transparent text-${themeConfig.colors.light.text.secondary} hover:text-${themeConfig.colors.light.text.primary} hover:border-${themeConfig.colors.light.border.hover}`
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <BaseCard>
              <div className="px-4 py-5 sm:p-6">
                <h3
                  className={`text-lg font-medium leading-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Profile Settings
                </h3>
                <form onSubmit={handleSubmit} className="mt-5">
                  {error && <div className="text-red-600 mb-4">{error}</div>}
                  {message && <div className="text-green-600 mb-4">{message}</div>}
                  <div className="space-y-6">
                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-50 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`block w-full rounded-md shadow-sm sm:text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-50 text-gray-900'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`py-2 px-4 rounded-md text-white ${
                        theme === 'dark'
                          ? 'bg-indigo-500 hover:bg-indigo-400'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </BaseCard>
          </div>
        )}

        {activeTab === 'gamification' && <Gamification />}

        {activeTab === 'purchases' && (
          <div
            className={`shadow sm:rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : theme === 'neurodivergent' ? 'bg-amber-100/50' : 'bg-white'
            }`}
          >
            <div className="px-4 py-5 sm:p-6">
              <h3
                className={`text-lg font-medium leading-6 mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                My Purchases & Access
              </h3>
              {loadingPurchases && <p>Loading...</p>}
              {!loadingPurchases && purchases.length === 0 && (
                <p
                  className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  No purchases found.
                </p>
              )}
              {!loadingPurchases && purchases.length > 0 && (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className={`rounded-lg p-4 ${
                        theme === 'dark'
                          ? 'bg-gray-700'
                          : theme === 'neurodivergent'
                          ? 'bg-amber-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <h4
                        className={`font-medium ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                        }`}
                      >
                        {purchase.products?.name || purchase.product_id}
                      </h4>
                      <p
                        className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        £{purchase.amount} •{' '}
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                      {purchase.status === 'completed' && (
                        <div className="mt-2">
                          {courseAccess.find(
                            (access) => access.module_id === purchase.product_id
                          ) ? (
                            <div
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-green-400'
                                  : theme === 'neurodivergent'
                                  ? 'text-teal-600'
                                  : 'text-green-600'
                              }`}
                            >
                              ✓ Active Access
                              {courseAccess.find(
                                (access) => access.module_id === purchase.product_id
                              )?.expires_at && (
                                <span className="ml-2">
                                  (Expires:{' '}
                                  {new Date(
                                    courseAccess.find(
                                      (access) =>
                                        access.module_id === purchase.product_id
                                    )!.expires_at!
                                  ).toLocaleDateString()}
                                  )
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`text-sm ${
                                theme === 'dark'
                                  ? 'text-red-400'
                                  : theme === 'neurodivergent'
                                  ? 'text-red-600'
                                  : 'text-red-600'
                              }`}
                            >
                              Access Expired or Revoked
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        className={`mt-2 inline-flex rounded-full px-2 text-xs font-semibold ${
                          purchase.status === 'completed'
                            ? theme === 'dark'
                              ? 'bg-green-900/20 text-green-400'
                              : theme === 'neurodivergent'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-green-100 text-green-800'
                            : purchase.status === 'refunded'
                            ? theme === 'dark'
                              ? 'bg-red-900/20 text-red-400'
                              : theme === 'neurodivergent'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-red-100 text-red-800'
                            : theme === 'dark'
                            ? 'bg-gray-900/20 text-gray-400'
                            : theme === 'neurodivergent'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {purchase.status.charAt(0).toUpperCase() +
                          purchase.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && <ThemeSelector />}
        {activeTab === 'accessibility' && (
          <div>
            <FontSelector />
            <LineSpacingSelector />
            <ReadingGuideSelector />
          </div>
        )}
      </div>
    </PageLayout>
  );
}