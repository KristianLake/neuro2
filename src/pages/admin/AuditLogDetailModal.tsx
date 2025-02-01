import { useTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow, format } from 'date-fns';
import { BaseModal, BaseButton } from '../../components/base';

interface AuditLogDetailModalProps {
  show: boolean;
  onClose: () => void;
  log: any;
}

export default function AuditLogDetailModal({ show, onClose, log }: AuditLogDetailModalProps) {
  const { theme } = useTheme();

  if (!log) return null;

  const modalFooter = (
    <BaseButton
      variant="secondary"
      onClick={onClose}
    >
      Close
    </BaseButton>
  );

  return (
    <BaseModal
      isOpen={show}
      onClose={onClose}
      title="Audit Log Details"
      size="lg"
      footer={modalFooter}
    >
      {/* Header */}
      <div className="mb-4">
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
    </BaseModal>
  );
}