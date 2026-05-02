/**
 * Simplified Authentication Hook (replaces Firebase Auth)
 * Uses localStorage for simple user persistence
 */
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';

interface User {
  uid: string;
  id: string;  // Add id alias for uid
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

export function AuthProvider(props: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('current-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('current-user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newUser: User = {
      uid: `user_${Date.now()}`,
      id: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
    };
    localStorage.setItem('current-user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('current-user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
  };

  return AuthContext.Provider({ value, children: props.children });
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
