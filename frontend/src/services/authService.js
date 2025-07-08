import { apiClient } from './apiClient';

export const authService = {
  registerUser: (payload) => apiClient.post('register-user/', payload).then(res => res.data),

  login: (payload) => apiClient.post('token/', payload).then(res => res.data),

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout/');
  },
};
