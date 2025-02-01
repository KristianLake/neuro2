import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { Purchase, Product } from '../../types/purchase';
import { Dialog } from '@headlessui/react';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

type ExtendedPurchase = Purchase;

export default function Purchases() {
  const { theme } = useTheme();
  const [purchases, setPurchases] = useState<ExtendedPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<ExtendedPurchase | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null); 

  const historyPerPage = 5;
  const ITEMS_PER_PAGE = 10;

  const [stats, setStats] = useState({
    totalRevenue: 0,
    completedPurchases: 0,
    refundedPurchases: 0,
    averagePurchaseValue: 0
  });

  useEffect(() => {
    fetchPurchases();
    fetchStats();
  }, [currentPage]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount, status');

      if (error) throw error;

      if (data) {
        const completed = data.filter(p => p.status === 'completed');
        const refunded = data.filter(p => p.status === 'refunded');
        
        setStats({
          totalRevenue: completed.reduce((sum, p) => sum + p.amount, 0),
          completedPurchases: completed.length,
          refundedPurchases: refunded.length,
          averagePurchaseValue: completed.length ? 
            completed.reduce((sum, p) => sum + p.amount, 0) / completed.length : 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total count
      const { count } = await supabase
        .from('purchases')
        .select('*', { count: 'exact', head: true });

      setTotalPurchases(count || 0);

      // Fetch paginated purchases
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          user_id,
          product_id,
          amount,
          status,
          payment_method,
          created_at,
          products (*)
        `)
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE - 1
        );

      if (error) throw error;
      
      // Fetch user details separately
      // Create properly typed purchases with all required fields
      const purchasesWithUsers = await Promise.all(
        (data || []).map(async (purchase) => {
          // Get user data
          // Get user data
          const { data: userData } = await supabase
            .from('users')
            .select('email, user_metadata')
            .eq('id', purchase.user_id)
            .single();
          // Ensure all required fields are present
          // Ensure all required fields are present
          // Create properly typed purchase object
          // Create properly typed purchase object
          const extendedPurchase: Purchase = {
            ...purchase,
            updated_at: purchase.created_at, // Use created_at as updated_at since it's not in the response
            products: purchase.products && Array.isArray(purchase.products) && purchase.products.length > 0 
              ? {
                  id: purchase.products[0].id,
                  name: purchase.products[0].name,
                  description: purchase.products[0].description,
                  type: purchase.products[0].type,
                  price: purchase.products[0].price,
                  created_at: purchase.products[0].created_at,
                  updated_at: purchase.products[0].updated_at || purchase.products[0].created_at
                }
              : null,
            user: userData || undefined
          };
          extendedPurchase.user = userData || undefined;
          
          return extendedPurchase;
        })
      );

      setPurchases(purchasesWithUsers);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setError('Failed to fetch purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedPurchase) return;

    try {
      setProcessingRefund(true);
      setError(null);

      // Update purchase status to refunded
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'refunded' })
        .eq('id', selectedPurchase.id);

      if (updateError) throw updateError;

      // Remove course access
      if (selectedPurchase?.products?.type === 'module') {
        await supabase
          .from('course_access')
          .delete()
          .eq('user_id', selectedPurchase.user_id)
          .eq('module_id', selectedPurchase.product_id);
      } else if (selectedPurchase?.products?.type === 'course') {
        // Remove access to all modules
        await supabase
          .from('course_access')
          .delete()
          .eq('user_id', selectedPurchase.user_id);
      }

      // Refresh purchases
      await fetchPurchases();
      await fetchStats();

      setShowRefundModal(false);
      setSelectedPurchase(null);
    } catch (error) {
      console.error('Error processing refund:', error);
      setError('Failed to process refund. Please try again.');
    } finally {
      setProcessingRefund(false);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const searchLower = searchQuery.toLowerCase();
    const userEmail = (purchase.user as any)?.email?.toLowerCase() || '';
    const userName = (purchase.user as any)?.user_metadata?.full_name?.toLowerCase() || '';
    const productName = purchase.products?.name.toLowerCase() || '';
    
    return userEmail.includes(searchLower) ||
           userName.includes(searchLower) ||
           productName.includes(searchLower) ||
           purchase.status.includes(searchLower);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Revenue */}
        <div className={`relative overflow-hidden rounded-lg p-6 ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <dt>
            <div className={`absolute rounded-md p-3 ${
              theme === 'dark'
                ? 'bg-indigo-500'
                : theme === 'neurodivergent'
                ? 'bg-teal-600'
                : 'bg-indigo-600'
            }`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`ml-16 truncate text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>Total Revenue</p>
          </dt>
          <dd className={`ml-16 flex items-baseline ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <p className="text-2xl font-semibold">£{stats.totalRevenue.toLocaleString()}</p>
          </dd>
        </div>

        {/* Completed Purchases */}
        <div className={`relative overflow-hidden rounded-lg p-6 ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <dt>
            <div className={`absolute rounded-md p-3 ${
              theme === 'dark'
                ? 'bg-green-500'
                : theme === 'neurodivergent'
                ? 'bg-teal-600'
                : 'bg-green-600'
            }`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className={`ml-16 truncate text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>Completed Purchases</p>
          </dt>
          <dd className={`ml-16 flex items-baseline ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <p className="text-2xl font-semibold">{stats.completedPurchases}</p>
          </dd>
        </div>

        {/* Refunded Purchases */}
        <div className={`relative overflow-hidden rounded-lg p-6 ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <dt>
            <div className={`absolute rounded-md p-3 ${
              theme === 'dark'
                ? 'bg-red-500'
                : theme === 'neurodivergent'
                ? 'bg-teal-600'
                : 'bg-red-600'
            }`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </div>
            <p className={`ml-16 truncate text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>Refunded Purchases</p>
          </dt>
          <dd className={`ml-16 flex items-baseline ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <p className="text-2xl font-semibold">{stats.refundedPurchases}</p>
          </dd>
        </div>

        {/* Average Purchase Value */}
        <div className={`relative overflow-hidden rounded-lg p-6 ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <dt>
            <div className={`absolute rounded-md p-3 ${
              theme === 'dark'
                ? 'bg-purple-500'
                : theme === 'neurodivergent'
                ? 'bg-teal-600'
                : 'bg-purple-600'
            }`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <p className={`ml-16 truncate text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
            }`}>Average Purchase</p>
          </dt>
          <dd className={`ml-16 flex items-baseline ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <p className="text-2xl font-semibold">£{stats.averagePurchaseValue.toFixed(2)}</p>
          </dd>
        </div>
      </div>

      {error && (
        <div className={`mb-4 rounded-md p-4 ${
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
          placeholder="Search purchases..."
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

      {/* Purchases Table */}
      <div className={`rounded-lg ${
        theme === 'dark'
          ? 'bg-gray-800'
          : theme === 'neurodivergent'
          ? 'bg-amber-100/50'
          : 'bg-white'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className={`py-3.5 pl-4 pr-3 text-left text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  User
                </th>
                <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Product
                </th>
                <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Amount
                </th>
                <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Status
                </th>
                <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Date
                </th>
                <th scope="col" className={`px-3 py-3.5 text-left text-sm font-semibold ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div>
                      <div className="font-medium">{(purchase.user as any)?.user_metadata?.full_name || 'N/A'}</div>
                      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {(purchase.user as any)?.email}
                      </div>
                    </div>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div>
                      <div className="font-medium">{purchase.products?.name}</div>
                      <div className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                        {purchase.products?.type}
                      </div>
                    </div>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    £{purchase.amount}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
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
                        : purchase.status === 'pending'
                        ? theme === 'dark'
                          ? 'bg-yellow-900/20 text-yellow-400'
                          : theme === 'neurodivergent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-yellow-100 text-yellow-800'
                        : theme === 'dark'
                        ? 'bg-gray-900/20 text-gray-400'
                        : theme === 'neurodivergent'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </span>
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {new Date(purchase.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    {purchase.status === 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedPurchase(purchase);
                          setShowRefundModal(true);
                        }}
                        className={`inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold ${
                          theme === 'dark'
                            ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                            : theme === 'neurodivergent'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:z-20 focus:outline-offset-0 disabled:opacity-50 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white ring-gray-600'
              : theme === 'neurodivergent'
              ? 'bg-amber-50 text-gray-900 ring-amber-200'
              : 'bg-white text-gray-900 ring-gray-300'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage * ITEMS_PER_PAGE >= totalPurchases}
          className={`relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset focus:z-20 focus:outline-offset-0 disabled:opacity-50 ${
            theme === 'dark'
              ? 'bg-gray-700 text-white ring-gray-600'
              : theme === 'neurodivergent'
              ? 'bg-amber-50 text-gray-900 ring-amber-200'
              : 'bg-white text-gray-900 ring-gray-300'
          }`}
        >
          Next
        </button>
      </div>

      {/* Refund Modal */}
      <Dialog
        as="div"
        className="relative z-50"
        open={showRefundModal}
        onClose={() => {
          if (!processingRefund) {
            setShowRefundModal(false);
            setSelectedPurchase(null);
          }
        }}
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
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                    theme === 'dark'
                      ? 'bg-red-900/20'
                      : theme === 'neurodivergent'
                      ? 'bg-red-100'
                      : 'bg-red-100'
                  }`}>
                    <XCircleIcon className={`h-6 w-6 ${
                      theme === 'dark'
                        ? 'text-red-400'
                        : theme === 'neurodivergent'
                        ? 'text-red-600'
                        : 'text-red-600'
                    }`} />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className={`text-base font-semibold leading-6 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Process Refund
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Are you sure you want to refund this purchase? This will:
                      </p>
                      <ul className={`mt-2 text-sm list-disc pl-5 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        <li>Mark the purchase as refunded</li>
                        <li>Remove course access for the user</li>
                        <li>This action cannot be undone</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                      theme === 'dark'
                        ? 'bg-red-600 hover:bg-red-500'
                        : theme === 'neurodivergent'
                        ? 'bg-red-600 hover:bg-red-500'
                        : 'bg-red-600 hover:bg-red-500'
                    }`}
                    onClick={handleRefund}
                    disabled={processingRefund}
                  >
                    {processingRefund ? 'Processing...' : 'Process Refund'}
                  </button>
                  <button
                    type="button"
                    className={`mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset sm:mt-0 sm:w-auto ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 ring-gray-600'
                        : theme === 'neurodivergent'
                        ? 'bg-amber-200 text-gray-900 hover:bg-amber-300 ring-amber-300'
                        : 'bg-white text-gray-900 hover:bg-gray-50 ring-gray-300'
                    }`}
                    onClick={() => {
                      setShowRefundModal(false);
                      setSelectedPurchase(null);
                    }}
                    disabled={processingRefund}
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