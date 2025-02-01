import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase, updateUserMetadata } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Dialog } from '@headlessui/react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { User } from '../../types/auth';

export default function Users() {
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingMetadata, setEditingMetadata] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState('');
  const [accessDuration, setAccessDuration] = useState<number>(0);
  const [accessDurationType, setAccessDurationType] = useState<'days' | 'months'>('days');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [profileHistory, setProfileHistory] = useState<Array<{
    id: string;
    field_name: string;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
  }>>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyHasMore, setHistoryHasMore] = useState(true);
  const historyPerPage = 5;
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [showPurchasesModal, setShowPurchasesModal] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUserPurchases = async (userId: string) => {
    try {
      setError(null);
      setPurchasesError(null);
      setLoadingPurchases(true);
      
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (purchasesError) throw purchasesError;

      const { data: access, error: accessError } = await supabase
        .from('course_access')
        .select('*')
        .eq('user_id', userId);

      if (accessError) throw accessError;

      setUserPurchases(purchases?.map(purchase => ({
        ...purchase,
        access: access?.find(a => a.module_id === purchase.product_id)
      })) || []);
      setLoadingPurchases(false);
    } catch (error) {
      console.error('Error fetching user purchases:', error);
      setError('Failed to fetch user purchases. Please try again.');
    }
  };

  const handleGrantAccess = async () => {
    try {
      setError(null);
      setAccessError(null);
      setLoadingAccess(true);
      
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
        p_user_id: selectedUserId,
        p_module_id: selectedModule,
        p_expires_at: expiresAt?.toISOString()
      });

      if (accessError) throw accessError;

      setShowAccessModal(false);
      setSelectedModule('');
      setAccessDuration(0);
      setSelectedUserId('');
      setLoadingAccess(false);

      // Refresh purchases if modal is open
      if (showPurchasesModal) {
        fetchUserPurchases(selectedUserId);
      }
    } catch (error) {
      console.error('Error granting access:', error);
      setError('Failed to grant access. Please try again.');
    }
  };

  const handleRevokeAccess = async (userId: string, moduleId: string) => {
    try {
      setError(null);
      setLoadingAccess(true);
      
      const { error: revokeError } = await supabase.rpc('revoke_course_access', {
        p_user_id: userId,
        p_module_id: moduleId
      });

      if (revokeError) throw revokeError;

      // Refresh user purchases
      if (showPurchasesModal) {
        fetchUserPurchases(userId);
      }
      setLoadingAccess(false);
    } catch (error) {
      console.error('Error revoking access:', error);
      setError('Failed to revoke access. Please try again.');
    }
  };

  const fetchProfileHistory = async (userId: string) => {
    try {
      const from = (historyPage - 1) * historyPerPage;
      const to = from + historyPerPage - 1;

      const { data, error } = await supabase
        .from('profile_history')
        .select(`
          *,
          users!profile_history_updater_id_fkey(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      // Check if we have more results
      const { count } = await supabase
        .from('profile_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      setHistoryHasMore(count ? from + data.length < count : false);
      setProfileHistory(data || []);
    } catch (error) {
      console.error('Error fetching profile history:', error);
    }
  };

  // Reset history pagination when selecting a new user
  useEffect(() => {
    setHistoryPage(1);
    setHistoryHasMore(true);
  }, [selectedUser]);

  // Fetch history when page changes
  useEffect(() => {
    if (selectedUser) {
      fetchProfileHistory(selectedUser);
    }
  }, [selectedUser, historyPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * usersPerPage;
      const to = from + usersPerPage - 1;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .range(from, to);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setIsEditing(true);
    setEditingUser(user);
    setEditingMetadata(JSON.stringify(user.user_metadata || {}, null, 2));
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const parsedMetadata = JSON.parse(editingMetadata);

      const { error } = await updateUserMetadata(
        editingUser.id,
        parsedMetadata,
        currentUser?.id || ''
      );

      if (error) throw error;

      setEditingUser(null);
      setIsEditing(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user metadata. Please try again.');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_metadata?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Error Notification */}
      {error && (
        <div className="mb-4 rounded-md p-4 bg-red-50 border border-red-200">
          <div className="flex">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                className="mt-2 text-sm font-medium text-red-600 hover:underline"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
      <p className="mt-2 text-sm text-gray-700">
        A list of all users in the platform, including their name, email, and role.
      </p>

      {/* Search Input */}
      <div className="mt-4">
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

      {/* Users Table */}
      <div className={`mt-8 rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${
            theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'
          }`}>
            <thead>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Name
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Email
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Role
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                } uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {user.user_metadata?.full_name || 'N/A'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {user.email}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    <div>
                      <div>{user.role}</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setShowAccessModal(true);
                          }}
                          className={`px-2 py-1 text-xs rounded-md ${
                            theme === 'dark'
                              ? 'bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/30'
                              : theme === 'neurodivergent'
                              ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          Grant Access
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setShowPurchasesModal(true);
                            fetchUserPurchases(user.id);
                          }}
                          className={`px-2 py-1 text-xs rounded-md ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : theme === 'neurodivergent'
                              ? 'bg-amber-100 text-gray-700 hover:bg-amber-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          View Purchases
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium`}>
                    <button
                      onClick={() => handleEditUser(user)}
                      className={`text-sm font-medium ${
                        theme === 'dark'
                          ? 'text-indigo-400 hover:text-indigo-300'
                          : theme === 'neurodivergent'
                          ? 'text-teal-600 hover:text-teal-500'
                          : 'text-indigo-600 hover:text-indigo-700'
                      }`}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

                {accessError && (
                  <div className={`mb-4 rounded-md p-4 ${
                    theme === 'dark'
                      ? 'bg-red-900/20 border border-red-800'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={theme === 'dark' ? 'text-red-400' : 'text-red-800'}>
                      {accessError}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Module Selection */}
                  <div>
                    <label className={`block text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Module
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
                      <option value="">Select a module</option>
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={`module-${num}`}>
                          Module {num}
                        </option>
                      ))}
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

      {/* Purchases Modal */}
      <Dialog
        as="div"
        className="relative z-50"
        open={showPurchasesModal}
        onClose={() => !loadingPurchases && setShowPurchasesModal(false)}
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
                  User Purchases & Access
                </h3>

                {purchasesError && (
                  <div className={`mb-4 rounded-md p-4 ${
                    theme === 'dark'
                      ? 'bg-red-900/20 border border-red-800'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={theme === 'dark' ? 'text-red-400' : 'text-red-800'}>
                      {purchasesError}
                    </p>
                  </div>
                )}

                {loadingPurchases ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className={`mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Loading purchases...
                    </p>
                  </div>
                ) : userPurchases.length === 0 ? (
                  <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    No purchases found for this user.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userPurchases.map((purchase) => (
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
                        <div>
                          <h4 className={`font-medium ${
                            theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                          }`}>
                            {purchase.products.name}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            £{purchase.amount} • {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                          {/* Show access status */}
                          {purchase.status === 'completed' && (
                            <div className="mt-2">
                              {purchase.access ? (
                                <div className={`text-sm ${
                                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  ✓ Active Access
                                  {purchase.access.expires_at && (
                                    <span className="ml-2">
                                      (Expires: {new Date(purchase.access.expires_at).toLocaleDateString()})
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRevokeAccess(purchase.user_id, purchase.product_id)}
                                    disabled={loadingAccess}
                                    className={`ml-4 px-2 py-1 text-xs rounded-md ${
                                      theme === 'dark'
                                        ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    } disabled:opacity-50`}
                                  >
                                    Revoke Access
                                  </button>
                                </div>
                              ) : (
                                <div className={`text-sm ${
                                  theme === 'dark' ? 'text-red-400' : 'text-red-600'
                                }`}>
                                  Access Expired or Revoked
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`mt-2 inline-flex rounded-full px-2 text-xs font-semibold ${
                            purchase.status === 'completed'
                              ? theme === 'dark'
                                ? 'bg-green-900/20 text-green-400'
                                : 'bg-green-100 text-green-800'
                              : purchase.status === 'refunded'
                              ? theme === 'dark'
                                ? 'bg-red-900/20 text-red-400'
                                : 'bg-red-100 text-red-800'
                              : theme === 'dark'
                              ? 'bg-gray-900/20 text-gray-400'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setShowPurchasesModal(false)}
                    className={`w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : theme === 'neurodivergent'
                        ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      {/* Edit Modal */}
      {editingUser && (
        <Dialog
          as="div"
          className="relative z-50"
          open={isEditing}
          onClose={() => setIsEditing(false)}
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
                    Edit User
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        User Metadata
                      </label>
                      <textarea
                        value={editingMetadata}
                        onChange={(e) => setEditingMetadata(e.target.value)}
                        rows={10}
                        className={`mt-1 block w-full rounded-md font-mono text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-200 border-gray-600'
                            : theme === 'neurodivergent'
                            ? 'bg-amber-50 text-gray-900 border-amber-200'
                            : 'bg-white text-gray-900 border-gray-300'
                        }`}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          theme === 'dark'
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : theme === 'neurodivergent'
                            ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveUser}
                        className={`px-3 py-2 text-sm font-medium rounded-md text-white ${
                          theme === 'dark'
                            ? 'bg-indigo-600 hover:bg-indigo-500'
                            : theme === 'neurodivergent'
                            ? 'bg-teal-600 hover:bg-teal-500'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
