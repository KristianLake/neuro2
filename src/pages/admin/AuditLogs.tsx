import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuditLog } from '../../hooks/useAuditLog';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { ThemedInput } from '../../components/common/ThemedInput';
import { ThemedSelect } from '../../components/common/ThemedSelect';
import { ThemedTable } from '../../components/common/ThemedTable';
import { ThemedAlert } from '../../components/common/ThemedAlert';
import { formatDistanceToNow } from 'date-fns';
import AuditLogDetailModal from '../../components/admin/AuditLogDetailModal';

const ITEMS_PER_PAGE = 20;

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'ADMIN_ACCESS', label: 'Admin Access' },
  { value: 'ADMIN_ACCESS_DENIED', label: 'Access Denied' },
  { value: 'USER_UPDATE', label: 'User Update' },
  { value: 'PURCHASE', label: 'Purchase' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'ACCESS_GRANT', label: 'Access Grant' },
  { value: 'ACCESS_REVOKE', label: 'Access Revoke' }
];

export default function AuditLogs() {
  const { theme } = useTheme();
  const { getAuditLogs, loading, error } = useAuditLog();
  const [logs, setLogs] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
      const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

      const result = await getAuditLogs({
        userId: filters.userId || undefined,
        action: filters.action || undefined,
        startDate,
        endDate,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE
      });

      setLogs(result || []);
      setTotalLogs(result?.length || 0);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRowClick = (log: any) => {
    setSelectedLog(log);
  };

  const columns = [
    {
      key: 'created_at',
      header: 'Time',
      render: (value: string) => formatDistanceToNow(new Date(value), { addSuffix: true })
    },
    {
      key: 'action',
      header: 'Action',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value.includes('DENIED')
            ? theme === 'dark'
              ? 'bg-red-900/20 text-red-400'
              : 'bg-red-100 text-red-800'
            : theme === 'dark'
            ? 'bg-green-900/20 text-green-400'
            : 'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'user_id',
      header: 'User',
      render: (value: string, item: any) => (
        <div>
          <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>
            {item.details?.user?.email || value}
          </div>
          {item.details?.user?.full_name && (
            <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
              {item.details.user.full_name}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'details',
      header: 'Details',
      render: (value: any) => (
        <div className={`max-w-md ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          {value ? (
            <pre className="whitespace-pre-wrap text-sm">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            'No details'
          )}
        </div>
      )
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (value: string) => value || 'N/A'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Audit Logs
        </h1>

        {error && (
          <ThemedAlert
            type="error"
            title="Error"
            message={error}
          />
        )}

        {/* Filters */}
        <div className={`p-4 rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ThemedInput
              label="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Filter by user ID"
            />
            <ThemedSelect
              label="Action Type"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              options={ACTION_TYPES}
            />
            <ThemedInput
              type="date"
              label="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
            <ThemedInput
              type="date"
              label="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className={`rounded-lg ${
          theme === 'dark'
            ? 'bg-gray-800'
            : theme === 'neurodivergent'
            ? 'bg-amber-100/50'
            : 'bg-white'
        }`}>
          <div className="p-4">
            <ThemedTable
              columns={columns}
              onRowClick={handleRowClick}
              data={logs}
            />
          </div>

          {/* Pagination */}
          {totalLogs > ITEMS_PER_PAGE && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * ITEMS_PER_PAGE >= totalLogs}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-200'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    Showing{' '}
                    <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                    {' '}to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * ITEMS_PER_PAGE, totalLogs)}
                    </span>
                    {' '}of{' '}
                    <span className="font-medium">{totalLogs}</span>
                    {' '}results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: Math.ceil(totalLogs / ITEMS_PER_PAGE) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                          currentPage === i + 1
                            ? theme === 'dark'
                              ? 'bg-gray-700 text-white'
                              : 'bg-indigo-600 text-white'
                            : theme === 'dark'
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } ${
                          i === 0 ? 'rounded-l-md' : ''
                        } ${
                          i === Math.ceil(totalLogs / ITEMS_PER_PAGE) - 1 ? 'rounded-r-md' : ''
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      <AuditLogDetailModal
        show={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </AdminLayout>
  );
}