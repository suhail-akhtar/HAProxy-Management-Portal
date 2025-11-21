
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { apiService, APIError } from '../services/apiService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Check for existing session
    const validateSession = async () => {
      const token = apiService.getToken();
      if (token) {
        try {
          const response = await apiService.validateToken();
          if (response.success && response.user) {
            setUser(response.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear it
            apiService.setToken(null);
            localStorage.removeItem('haproxy_user');
          }
        } catch (err) {
          // Token validation failed, clear session
          apiService.setToken(null);
          localStorage.removeItem('haproxy_user');
        }
      }
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('haproxy_user', JSON.stringify(response.user));
        showToast('Login successful', 'success');
        setIsLoading(false);
        return true;
      } else {
        setError('Login failed');
        showToast('Login failed', 'error');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'An error occurred during login. Please check your connection.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('haproxy_user');
      showToast('Logged out successfully', 'info');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
