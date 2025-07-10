import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

// Add auth header only if not a public endpoint:
apiClient.interceptors.request.use(
  config => {
    const publicEndpoints = ['register-user/', 'token/', 'login/']; // no token needed here
    
    try {
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

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No valid token found for authenticated endpoint:', config.url);
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if we don't have a config, are already retrying, or don't have a response
    if (!originalRequest || originalRequest._retry || !error.response) {
      return Promise.reject(error);
    }

    // Handle unauthorized errors (401)
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Token expired, attempting refresh...');

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken && refreshToken !== 'null' && refreshToken !== 'undefined') {
          const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}/token/refresh/`, {
            refresh: refreshToken
          });

          if (response.data && response.data.access) {
            const { access } = response.data;
            
            // Store the new access token
            localStorage.setItem('access_token', access);
            localStorage.setItem('token', access); // For backward compatibility
            
            // Update the Authorization header
            originalRequest.headers.Authorization = `Bearer ${access}`;
            console.log('Token refreshed successfully');
            
            // Retry the original request
            return apiClient(originalRequest);
          } else {
            throw new Error('Invalid refresh token response');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear all auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login after a short delay to allow this response to complete
        setTimeout(() => {
          window.location.href = '/login?session_expired=true';
        }, 100);
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with a status code outside the 2xx range
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Error: No response received', error.request);
    } else {
      // Something else caused the error
      console.error('API Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;