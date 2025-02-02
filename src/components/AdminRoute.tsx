import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useEffect, useState } from 'react';
import { auditLogger } from '../utils/auditLog';
import { AdminAuthError } from '../middleware/adminAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const { checkAdminAccess } = useAdminAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        await checkAdminAccess();
        setHasAccess(true);
        
        // Log admin access
        if (user) {
          await auditLogger.log({
            action: 'ADMIN_ACCESS',
            userId: user.id,
            details: {
              path: window.location.pathname
            }
          });
        }
      } catch (error) {
        setHasAccess(false);
        
        // Log access attempt
        if (user) {
          await auditLogger.log({
            action: 'ADMIN_ACCESS_DENIED',
            userId: user.id,
            details: {
              path: window.location.pathname,
              error: error instanceof AdminAuthError ? error.message : 'Unknown error'
            }
          });
        }
      } finally {
        setAccessChecked(true);
      }
    };

    if (user && !loading) {
      verifyAccess();
    }
  }, [user, loading, checkAdminAccess]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user || !accessChecked) {
    return null;
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}