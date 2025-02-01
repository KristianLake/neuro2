import { Outlet } from 'react-router-dom';
import { AdminNav } from '../admin/AdminNav';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { themeConfig } from '../../config/theme';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const styles = useThemeStyles();
  const { spacing } = themeConfig;

  return (
    <div className={`max-w-7xl mx-auto ${spacing.page.x} ${spacing.page.y}`}>
      <AdminNav />
      {children || <Outlet />}
    </div>
  );
}