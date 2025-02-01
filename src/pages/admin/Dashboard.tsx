import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { AdminStats, User } from '../../types/auth';
import { UsersIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { StatsCard } from '../../components/admin/StatsCard';
import { AdminLayout } from '../../components/layouts/AdminLayout';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const location = useLocation();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 9, // Hardcoded for now
    completionRate: 0,
    securityAlerts: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact' });

        // Get active users (users who have logged in within the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: activeUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact' })
          .gt('last_login_at', thirtyDaysAgo.toISOString());

        // Get security alerts count
        const { count: securityAlerts } = await supabase
          .from('auth_notifications')
          .select('*', { count: 'exact' })
          .is('read_at', null)
          .in('type', ['suspicious_activity', 'login_failed', 'verification_failed']);

        // Get recent users
        const { data: recent } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Calculate completion rate (placeholder for now)
        const completionRate = 65;

        setStats({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          totalCourses: 9,
          completionRate,
          securityAlerts: securityAlerts || 0
        });

        setRecentUsers(recent || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      {location.pathname === '/admin' && (
        <div>
          <h1 className={`text-3xl font-bold mb-8 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Admin Dashboard
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard icon={<UsersIcon />} label="Total Users" value={stats.totalUsers} />
            <StatsCard icon={<BookOpenIcon />} label="Active Users" value={stats.activeUsers} />
            <StatsCard icon={<AcademicCapIcon />} label="Total Courses" value={stats.totalCourses} />
            <StatsCard icon={<ChartBarIcon />} label="Completion Rate" value={`${stats.completionRate}%`} />
            <StatsCard 
              icon={<ShieldCheckIcon />} 
              label="Security Alerts" 
              value={stats.securityAlerts} 
              alert={stats.securityAlerts > 0}
            />
          </div>
        </div>
      )}

      {/* Renders child routes */}
      <Outlet />
    </AdminLayout>
  );
}