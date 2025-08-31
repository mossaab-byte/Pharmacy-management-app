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
          // No authentication data - user needs to log in
          clearAuth();
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
      const response = await fetch('http://localhost:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Store authentication data
        localStorage.setItem('access_token', result.access);
        localStorage.setItem('refresh_token', result.refresh);
        localStorage.setItem('token', result.access);
        
        // Create user object with data from login response
        const userObj = {
          id: result.user_id,
          username: result.username,
          email: result.email,
          first_name: result.first_name,
          last_name: result.last_name,
          is_pharmacist: result.is_pharmacist,
          is_manager: result.is_manager,
          can_manage_inventory: result.can_manage_inventory,
          can_manage_sales: result.can_manage_sales,
          can_manage_purchases: result.can_manage_purchases,
          can_manage_users: result.can_manage_users,
          can_view_reports: result.can_view_reports,
          pharmacy: result.pharmacy
        };
        
        localStorage.setItem('user', JSON.stringify(userObj));
        setToken(result.access);
        setUser(userObj);

        return { success: true, user: userObj };
      } else {
        return { 
          success: false, 
          error: result.detail || result.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
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
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (response.ok) {
        const result = await response.json();
        const access = result.access;
        localStorage.setItem('access_token', access);
        localStorage.setItem('token', access);
        setToken(access);
        return access;
      } else {
        throw new Error('Token refresh failed');
      }
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
