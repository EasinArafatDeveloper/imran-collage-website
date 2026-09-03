'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/types';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  avatar?: string;
  studentProfile?: {
    studentId: string;
    department: string;
    faculty?: string;
    semester?: string;
    phone?: string;
    program?: string;
    bio?: string;
  } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; user?: AuthUser; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real authenticated session from server cookies / token
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (identifier: string, password = 'password123') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email: identifier, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Invalid email or password' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network connection issue' };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, user: data.user, message: data.message };
      }
      return { success: false, message: data.message || 'Failed to complete registration' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network connection issue' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
