import { Dialog } from '@headlessui/react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow, format } from 'date-fns';

interface AuditLogDetailModalProps {
  show: boolean;
  onClose: () => void;
  log: any;
}

export default function AuditLogDetailModal({ show, onClose, log }: AuditLogDetailModalProps) {
  const { theme } = useTheme();

  if (!log) return null;

  return (
    <Dialog
      as="div"
      className="relative z-50"
      open={show}
      onClose={onClose}
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
              {/* Header */}
              <div className="mb-4">
                <Dialog.Title as="h3" className={`text-lg font-medium leading-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Audit Log Details
                </Dialog.Title>
                <p className={`mt-1 text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {format(new Date(log.created_at), 'PPpp')}
                  {' '}({formatDistanceToNow(new Date(log.created_at), { addSuffix: true })})
                </p>
              </div>

              {/* Action Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  log.action.includes('DENIED')
                    ? theme === 'dark'
                      ? 'bg-red-900/20 text-red-400'
                      : 'bg-red-100 text-red-800'
                    : theme === 'dark'
                    ? 'bg-green-900/20 text-green-400'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {log.action}
                </span>
              </div>

              {/* User Info */}
              <div className={`mb-4 p-3 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <h4 className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>User Information</h4>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <p>ID: {log.user_id}</p>
                  {log.details?.user?.email && (
                    <p>Email: {log.details.user.email}</p>
                  )}
                  {log.details?.user?.full_name && (
                    <p>Name: {log.details.user.full_name}</p>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className={`mb-4 p-3 rounded-lg ${
                theme === 'dark'
                  ? 'bg-gray-700'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50'
                  : 'bg-gray-50'
              }`}>
                <h4 className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>Request Details</h4>
                <div className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <p>IP Address: {log.ip_address || 'N/A'}</p>
                  {log.user_agent && <p>User Agent: {log.user_agent}</p>}
                  {log.details?.path && <p>Path: {log.details.path}</p>}
                  {log.details?.method && <p>Method: {log.details.method}</p>}
                </div>
              </div>

              {/* Additional Details */}
              {log.details && (
                <div className={`mb-4 p-3 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-50'
                    : 'bg-gray-50'
                }`}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>Additional Details</h4>
                  <pre className={`text-sm whitespace-pre-wrap ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}

              {/* Close Button */}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:ml-3 sm:w-auto sm:text-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : theme === 'neurodivergent'
                      ? 'bg-amber-200 text-gray-900 hover:bg-amber-300'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}