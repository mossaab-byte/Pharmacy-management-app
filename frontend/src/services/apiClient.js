import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

// Add auth header only if not a public endpoint:
apiClient.interceptors.request.use(config => {
  const publicEndpoints = ['register-user/', 'token/', 'login/']; // no token needed here
  
  // Check if the current request URL matches any public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => {
    // Handle both with and without leading slash
    const normalizedUrl = config.url?.replace(/^\//, '');
    const normalizedEndpoint = endpoint.replace(/^\//, '');
    return normalizedUrl === normalizedEndpoint || normalizedUrl?.startsWith(normalizedEndpoint);
  });

  if (isPublicEndpoint) {
    // do not add Authorization header for public endpoints
    console.log('Public endpoint detected, skipping auth header:', config.url);
    return config;
  }

  const token = localStorage.getItem('access_token');
  if (token && token !== 'null') { // Also check if token is not the string 'null'
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken && refreshToken !== 'null') {
          const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/token/refresh/`, {
            refresh: refreshToken
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);