import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Admin } from '../types';

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User | Admin, isAdmin?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const adminData = localStorage.getItem('admin');

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    if (token && adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
      }
    }

    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User | Admin, isAdmin = false) => {
    localStorage.setItem('token', token);
    
    if (isAdmin) {
      localStorage.setItem('admin', JSON.stringify(userData));
      localStorage.removeItem('user');
      setAdmin(userData as Admin);
      setUser(null);
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.removeItem('admin');
      setUser(userData as User);
      setAdmin(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setUser(null);
    setAdmin(null);
  };

  const isAuthenticated = !!(user || admin);

  const value: AuthContextType = {
    user,
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
