import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/auth';
import { Dialog } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface AccessRecord {
  id: string;
  user_id: string;
  module_id: string;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
}

interface UserWithAccess extends User {
  access: AccessRecord[];
}

export default function AccessManagement() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithAccess | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [accessDuration, setAccessDuration] = useState<number>(0);
  const [accessDurationType, setAccessDurationType] = useState<'days' | 'months'>('days');
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      // Get all access records
      const { data: accessData, error: accessError } = await supabase
        .from('course_access')
        .select('*');

      if (accessError) throw accessError;

      // Combine users with their access records
      const usersWithAccess = usersData.map(user => ({
        ...user,
        access: accessData.filter(access => access.user_id === user.id) || []
      }));

      setUsers(usersWithAccess);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users and access data');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedUser || !selectedModule) return;

    try {
      setLoadingAccess(true);
      setError(null);

      // Calculate expiration date if duration is set
      let expiresAt = null;
      if (accessDuration > 0) {
        expiresAt = new Date();
        if (accessDurationType === 'days') {
          expiresAt.setDate(expiresAt.getDate() + accessDuration);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + accessDuration);
        }
      }

      const { error: accessError } = await supabase.rpc('manage_course_access', {
        p_user_id: selectedUser.id,
        p_module_id: selectedModule,
        p_expires_at: expiresAt?.toISOString()
      });

      if (accessError) throw accessError;

      // Refresh data
      await fetchUsers();
      setShowAccessModal(false);
      setSelectedModule('');
      setAccessDuration(0);

    } catch (error) {
      console.error('Error granting access:', error);
      setError('Failed to grant access');
    } finally {
      setLoadingAccess(false);
    }
  };

  const handleRevokeAccess = async (userId: string, moduleId: string) => {
    try {
      setLoadingAccess(true);
      setError(null);

      const { error: revokeError } = await supabase.rpc('revoke_course_access', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      if (revokeError) throw revokeError;

      // Refresh data
      await fetchUsers();
    } catch (error) {
      console.error('Error revoking access:', error);
      setError('Failed to revoke access');
    } finally {
      setLoadingAccess(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const email = user.email.toLowerCase();
    const name = user.user_metadata?.full_name?.toLowerCase() || '';
    return email.includes(searchLower) || name.includes(searchLower);
  });

  const getRemainingTime = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days remaining` : 'Expired';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Error Display */}
      {error && (
        <div className={`mb-6 rounded-lg p-4 ${
          theme === 'dark'
            ? 'bg-red-900/20 border border-red-800'
            : theme === 'neurodivergent'
            ? 'bg-red-50 border border-red-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <XCircleIcon className={`h-5 w-5 ${
              theme === 'dark'
                ? 'text-red-400'
                : theme === 'neurodivergent'
                ? 'text-red-600'
                : 'text-red-400'
            }`} />
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                theme === 'dark'
                  ? 'text-red-400'
                  : theme === 'neurodivergent'
                  ? 'text-red-800'
                  : 'text-red-800'
              }`}>
                Error
              </h3>
              <div className={`mt-2 text-sm ${
                theme === 'dark'
                  ? 'text-red-300'
                  : theme === 'neurodivergent'
                  ? 'text-red-700'
                  : 'text-red-700'
              }`}>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white ring-gray-600 placeholder:text-gray-400 focus:ring-indigo-500'
              : theme === 'neurodivergent'
              ? 'bg-amber-50 text-gray-900 ring-amber-200 placeholder:text-gray-400 focus:ring-teal-600'
              : 'bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600'
          }`}
        />
      </div>

      {/* Users List */}
      <div className={`rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="px-4 py-5 sm:p-6">
          <h2 className={`text-lg font-medium leading-6 mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            User Access Management
          </h2>

          <div className="space-y-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`rounded-lg p-4 ${
                  theme === 'dark'
                    ? 'bg-gray-700'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50'
                    : 'bg-gray-50'
                }`}
              >
                {/* User Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.user_metadata?.full_name || 'No Name'}
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowAccessModal(true);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                        : theme === 'neurodivergent'
                        ? 'bg-teal-600 text-white hover:bg-teal-500'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    Grant Access
                  </button>
                </div>

                {/* Access List */}
                {user.access.length > 0 ? (
                  <div className="space-y-2">
                    {user.access.map((access) => (
                      <div
                        key={access.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          theme === 'dark'
                            ? 'bg-gray-800'
                            : theme === 'neurodivergent'
                            ? 'bg-white'
                            : 'bg-white'
                        }`}
                      >
                        <div>
                          <p className={`font-medium ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {access.module_id}
                          </p>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {getRemainingTime(access.expires_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRevokeAccess(user.id, access.module_id)}
                          disabled={loadingAccess}
                          className={`px-2 py-1 text-xs rounded-md ${
                            theme === 'dark'
                              ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                              : theme === 'neurodivergent'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100'
                          } disabled:opacity-50`}
                        >
                          Revoke Access
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No active access permissions
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grant Access Modal */}
      <Dialog
        as="div"
        className="relative z-50"
        open={showAccessModal}
        onClose={() => !loadingAccess && setShowAccessModal(false)}
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Dialog.Panel className={`relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg ${
              theme === 'dark'
                ? 'bg-gray-800'
                : theme === 'neurodivergent'
                ? 'bg-amber-100/50'
                : 'bg-white'
            }`}>
              <div className="px-4 py-5 sm:p-6">
                <h3 className={`text-lg font-medium leading-6 mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Grant Course Access
                </h3>

                <div className="space-y-4">
                  {/* Module Selection */}
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Access Type
                    </label>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className={`mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-white ring-gray-600 focus:ring-indigo-500'
                          : theme === 'neurodivergent'
                          ? 'bg-amber-50 text-gray-900 ring-amber-200 focus:ring-teal-600'
                          : 'bg-white text-gray-900 ring-gray-300 focus:ring-indigo-600'
                      }`}
                    >
                      <option value="">Select access type</option>
                      <optgroup label="Individual Modules">
                        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={`module-${num}`}>
                            Module {num}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Full Course">
                        <option value="full-course">Standard Course</option>
                        <option value="full-course-premium">Premium Course</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Duration (optional)
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={accessDuration}
                        onChange={(e) => setAccessDuration(parseInt(e.target.value) || 0)}
                        className={`block w-24 rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-white ring-gray-600 focus:ring-indigo-500'
                            : theme === 'neurodivergent'
                            ? 'bg-amber-50 text-gray-900 ring-amber-200 focus:ring-teal-600'
                            : 'bg-white text-gray-900 ring-gray-300 focus:ring-indigo-600'
                        }`}
                      />
                      <select
                        value={accessDurationType}
                        onChange={(e) => setAccessDurationType(e.target.value as 'days' | 'months')}
                        className={`block rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset focus:ring-2 sm:text-sm sm:leading-6 ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-white ring-gray-600 focus:ring-indigo-500'
                            : theme === 'neurodivergent'
                            ? 'bg-amber-50 text-gray-900 ring-amber-200 focus:ring-teal-600'
                            : 'bg-white text-gray-900 ring-gray-300 focus:ring-indigo-600'
                        }`}
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    <p className={`mt-1 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Leave at 0 for unlimited access
                    </p>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleGrantAccess}
                    disabled={!selectedModule || loadingAccess}
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                      theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-500'
                        : theme === 'neurodivergent'
                        ? 'bg-teal-600 hover:bg-teal-500'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    } disabled:opacity-50`}
                  >
                    {loadingAccess ? 'Granting Access...' : 'Grant Access'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAccessModal(false)}
                    disabled={loadingAccess}
                    className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 ring-gray-600'
                        : theme === 'neurodivergent'
                        ? 'bg-amber-200 text-gray-900 hover:bg-amber-300 ring-amber-300'
                        : 'bg-white text-gray-900 hover:bg-gray-50 ring-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}