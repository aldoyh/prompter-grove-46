/**
 * Authentication Hook with Firebase Integration
 */
import { useState, useEffect, useContext, createContext } from 'react';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
}

const AuthContext: any = createContext(null);

export function AuthProvider(props: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, function(user: any) {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  var value = {
    user: user,
    loading: loading
  };

  return AuthContext.Provider({ value: value, children: props.children });
}

export function useAuth(): AuthContextType {
  var context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}