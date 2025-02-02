import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { commonThemeStyles } from '../../utils/theme';

interface NavItem {
  path: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/admin', label: 'Overview' },
  { path: '/admin/users', label: 'Users' },
  { path: '/admin/purchases', label: 'Purchases' },
  { path: '/admin/access', label: 'Access Management' },
  { path: '/admin/audit-logs', label: 'Audit Logs' },
  { path: '/admin/security', label: 'Security' }
];

export function AdminNav() {
  const { theme } = useTheme();
  const location = useLocation();

  return (
    <div className={`mb-8 border-b ${
      theme === 'dark'
        ? 'border-gray-700'
        : theme === 'neurodivergent'
        ? 'border-amber-200'
        : 'border-gray-200'
    }`}>
      <nav className="flex space-x-4">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path;
          const styles = commonThemeStyles.nav(theme, isActive);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded-md text-sm font-medium
                ${styles.background} ${styles.text} ${styles.hover}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}