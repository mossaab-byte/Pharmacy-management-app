import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('access_token') || localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Set mock user for development
          const mockUser = {
            id: 1,
            username: 'marouaneTibary',
            email: 'marouane@pharmacy.com',
            first_name: 'Marouane',
            last_name: 'Tibary',
            pharmacy: {
              id: 1,
              name: 'PharmaGestion',
              address: '123 Main St, City',
              phone: '+212-555-0123',
              email: 'contact@pharmagestion.com'
            }
          };
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('token', 'mock-token');
          setUser(mockUser);
          setToken('mock-token');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      // Mock login for development
      const mockUser = {
        id: 1,
        username: credentials.username || 'marouaneTibary',
        email: 'marouane@pharmacy.com',
        first_name: 'Marouane',
        last_name: 'Tibary',
        pharmacy: {
          id: 1,
          name: 'PharmaGestion',
          address: '123 Main St, City',
          phone: '+212-555-0123',
          email: 'contact@pharmagestion.com'
        }
      };

      // Store tokens
      localStorage.setItem('access_token', 'mock-access-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
      localStorage.setItem('token', 'mock-access-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      setToken('mock-access-token');
      setUser(mockUser);

      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    window.location.href = '/login';
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      // Mock refresh token
      const access = 'mock-refreshed-token';
      localStorage.setItem('access_token', access);
      localStorage.setItem('token', access);
      setToken(access);
      return access;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      throw error;
    }
  }, [clearAuth]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!token && !!user,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
