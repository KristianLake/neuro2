import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from '../../components/layouts/AdminLayout';
import { ThemedTable } from '../../components/common/ThemedTable';
import { ThemedAlert } from '../../components/common/ThemedAlert';
import { formatDistanceToNow } from 'date-fns';

export default function Security() {
  const { theme } = useTheme();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch active sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('active_sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (sessionsError) throw sessionsError;
        setActiveSessions(sessions || []);

        // Fetch suspicious activities
        const { data: activities, error: activitiesError } = await supabase
          .from('suspicious_activities')
          .select('*')
          .order('last_login_at', { ascending: false });

        if (activitiesError) throw activitiesError;
        setSuspiciousActivities(activities || []);

        // Fetch unread notifications
        const { data: notifications, error: notificationsError } = await supabase
          .from('unread_notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (notificationsError) throw notificationsError;
        setUnreadNotifications(notifications || []);

      } catch (error) {
        console.error('Error fetching security data:', error);
        setError('Failed to fetch security information');
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
    
    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel('security_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'auth_notifications'
      }, () => {
        fetchSecurityData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('auth_sessions')
        .update({ 
          is_active: false,
          expires_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Refresh sessions
      const { data: sessions } = await supabase
        .from('active_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      setActiveSessions(sessions || []);
    } catch (error) {
      console.error('Error terminating session:', error);
      setError('Failed to terminate session');
    }
  };

  const handleLockAccount = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          locked_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Lock for 24 hours
        })
        .eq('id', userId);

      if (error) throw error;

      // Refresh activities
      const { data: activities } = await supabase
        .from('suspicious_activities')
        .select('*')
        .order('last_login_at', { ascending: false });

      setSuspiciousActivities(activities || []);
    } catch (error) {
      console.error('Error locking account:', error);
      setError('Failed to lock account');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <h1 className={`text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Security Dashboard
        </h1>

        {error && (
          <ThemedAlert
            type="error"
            title="Error"
            message={error}
          />
        )}

        {/* Active Sessions */}
        <div>
          <h2 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Active Sessions
          </h2>
          <ThemedTable
            columns={[
              { key: 'user_name', header: 'User' },
              { key: 'ip_address', header: 'IP Address' },
              { 
                key: 'location',
                header: 'Location',
                render: (value: any) => `${value.city}, ${value.country}`
              },
              {
                key: 'created_at',
                header: 'Started',
                render: (value: string) => formatDistanceToNow(new Date(value), { addSuffix: true })
              },
              {
                key: 'id',
                header: 'Actions',
                render: (value: string) => (
                  <button
                    onClick={() => handleTerminateSession(value)}
                    className={`px-2 py-1 text-xs rounded-md ${
                      theme === 'dark'
                        ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                        : theme === 'neurodivergent'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Terminate
                  </button>
                )
              }
            ]}
            data={activeSessions}
          />
        </div>

        {/* Suspicious Activities */}
        <div>
          <h2 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Suspicious Activities
          </h2>
          <ThemedTable
            columns={[
              { key: 'user_name', header: 'User' },
              { key: 'email', header: 'Email' },
              { 
                key: 'country_count',
                header: 'Countries (24h)',
                render: (value: number) => value > 2 ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    theme === 'dark'
                      ? 'bg-red-900/20 text-red-400'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {value} countries
                  </span>
                ) : value
              },
              {
                key: 'failed_login_count',
                header: 'Failed Logins (1h)',
                render: (value: number) => value >= 3 ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    theme === 'dark'
                      ? 'bg-red-900/20 text-red-400'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {value} attempts
                  </span>
                ) : value
              },
              {
                key: 'id',
                header: 'Actions',
                render: (value: string, item: any) => (
                  <button
                    onClick={() => handleLockAccount(item.user_id)}
                    disabled={item.locked_until && new Date(item.locked_until) > new Date()}
                    className={`px-2 py-1 text-xs rounded-md ${
                      theme === 'dark'
                        ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30'
                        : theme === 'neurodivergent'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    } disabled:opacity-50`}
                  >
                    {item.locked_until && new Date(item.locked_until) > new Date()
                      ? 'Locked'
                      : 'Lock Account'}
                  </button>
                )
              }
            ]}
            data={suspiciousActivities}
          />
        </div>

        {/* Security Notifications */}
        <div>
          <h2 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Security Notifications
          </h2>
          <div className="space-y-4">
            {unreadNotifications.map(notification => (
              <div
                key={notification.id}
                className={`rounded-lg p-4 ${
                  theme === 'dark'
                    ? 'bg-gray-800'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-100/50'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`mt-1 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {notification.message}
                    </p>
                    <p className={`mt-1 text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {notification.details && (
                    <div className={`ml-4 flex-shrink-0 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(notification.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}