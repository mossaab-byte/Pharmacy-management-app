import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      // Token might be expired, clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    loading: true,
  });

  // ✅ Manually update user (used in register)
  const setUser = (user) => {
    setAuthState((prev) => ({ ...prev, user }));
    localStorage.setItem('user', JSON.stringify(user));
  };

  // ✅ Manually update tokens (used in register)
  const setTokens = ({ access }) => {
    setAuthState((prev) => ({ ...prev, token: access }));
    localStorage.setItem('token', access);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  };

  // ✅ Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    let user = null;

    try {
      const userData = localStorage.getItem('user');
      if (userData && userData !== 'undefined') {
        user = JSON.parse(userData);
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      user = null;
    }

    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthState({
        user,
        token,
        loading: false,
      });
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // ✅ Login function
  const login = useCallback(async (credentials) => {
    try {
      const { data } = await api.post('/token/', credentials);

      localStorage.setItem('token', data.access);
      localStorage.setItem('user', JSON.stringify(data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;

      setAuthState({
        user: data.user,
        token: data.access,
        loading: false,
      });

      return data;
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      throw err;
    }
  }, []);

  // ✅ Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];

    setAuthState({
      user: null,
      token: null,
      loading: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        isAuthenticated: !!authState.token,
        setUser,     // ✅ exposed to components
        setTokens,   // ✅ exposed to components
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
