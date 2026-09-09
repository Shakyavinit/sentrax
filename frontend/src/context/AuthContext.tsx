import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'ANALYST' | 'OFFICER' | 'INVESTIGATOR';
  full_name: string;
  badge_number?: string;
  access_token: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (userData: UserSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('sentrax_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const handleAuthFail = () => {
      setUser(null);
    };
    window.addEventListener('sentrax_auth_failed', handleAuthFail);
    return () => window.removeEventListener('sentrax_auth_fail', handleAuthFail);
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem('sentrax_token', userData.access_token);
    localStorage.setItem('sentrax_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sentrax_token');
    localStorage.removeItem('sentrax_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
