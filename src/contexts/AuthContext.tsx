import { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { full_name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          ...session.user,
          role: session.user.user_metadata?.role || 'user'
        } as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          ...session.user,
          role: session.user.user_metadata?.role || 'user'
        } as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    // Password strength validation
    if (password.length < 12) {
      throw new Error('Password must be at least 12 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user', // Explicitly set default role
          },
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    // Rate limiting check
    const rateLimitKey = `signin_attempts_${email}`;
    const attempts = parseInt(localStorage.getItem(rateLimitKey) || '0');
    const lastAttempt = parseInt(localStorage.getItem(`${rateLimitKey}_time`) || '0');
    const now = Date.now();

    if (attempts >= 5 && now - lastAttempt < 15 * 60 * 1000) { // 15 minutes
      throw new Error('Too many login attempts. Please try again later.');
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Track failed attempts
        localStorage.setItem(rateLimitKey, (attempts + 1).toString());
        localStorage.setItem(`${rateLimitKey}_time`, now.toString());
        throw error;
      }

      // Clear rate limiting on success
      localStorage.removeItem(rateLimitKey);
      localStorage.removeItem(`${rateLimitKey}_time`);
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // First clear local state
      setUser(null);
      // Then attempt to clear server session
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Error is already logged and local state is cleared
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const updateProfile = async (data: { full_name?: string }) => {
    try {
      // Input validation and sanitization
      if (!data.full_name?.trim()) {
        throw new Error('Name cannot be empty');
      }

      // Verify user is authenticated
      if (!user?.id) {
        throw new Error('You must be logged in to update your profile');
      }

      // Sanitize and normalize input
      const trimmedName = data.full_name.trim().slice(0, 100); // Limit length
      
      // Skip if no changes
      if (user.user_metadata?.full_name === trimmedName) {
        return;
      }

      // Prepare update data
      const updateData = {
        data: { full_name: trimmedName }
      };

      // Attempt update with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const updatePromise = supabase.auth.updateUser(updateData);

      try {
        const { data: result, error } = await Promise.race([
          updatePromise,
          timeoutPromise
        ]) as any;

        if (error) {
          // Handle specific error cases
          if (error.status === 401) {
            throw new Error('Your session has expired. Please sign in again.');
          }

          if (error.status === 500) {
            throw new Error('Unable to update profile at this time. Please try again later.');
          }

          throw new Error('Failed to update profile. Please try again.');
        }

        if (result?.user) {
          // Update local state optimistically
          const updatedUser = {
            ...result.user,
            role: user?.role || 'user',
            user_metadata: {
              ...user?.user_metadata,
              full_name: trimmedName
            }
          } as User;

          setUser(updatedUser);
          return;
        }

        throw new Error('Profile update failed. Please try again.');
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Request timeout') {
            throw new Error('The request timed out. Please check your connection and try again.');
          }

          if (error.message.includes('session has expired')) {
            throw error;
          }

          if (error.message.includes('Unable to update profile')) {
            throw error;
          }
        }

        throw new Error('An unexpected error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}