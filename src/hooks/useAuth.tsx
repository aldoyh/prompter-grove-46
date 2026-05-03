'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

export interface User {
  uid: string;
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Use setTimeout to defer state update and avoid setState in effect
    const timer = setTimeout(() => {
      try {
        const storedUser = localStorage.getItem('current-user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        localStorage.removeItem('current-user');
      } finally {
        setLoading(false);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const login = useCallback((email: string) => {
    const newUser: User = {
      uid: `user_${Date.now()}`,
      id: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    localStorage.setItem('current-user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('current-user');
    setUser(null);
  }, []);

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
