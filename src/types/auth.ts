export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  completionRate: number;
  securityAlerts: number;
}