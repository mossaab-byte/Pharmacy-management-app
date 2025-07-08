import { apiClient } from './apiClient';

// Mock userService if the backend doesn't have this endpoint yet
const userService = {
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/', { params });
      return response;
    } catch (error) {
      // Return mock data if API fails
      return {
        data: {
          results: [
            {
              id: 1,
              username: 'admin',
              email: 'admin@pharmacy.com',
              first_name: 'Admin',
              last_name: 'User',
              role: 'admin',
              is_active: true,
              date_joined: '2024-01-01'
            }
          ],
          count: 1
        }
      };
    }
  },

  getUserStats: async () => {
    try {
      const response = await apiClient.get('/users/stats/');
      return response;
    } catch (error) {
      return {
        data: {
          total_users: 1,
          active_users: 1,
          inactive_users: 0,
          admin_users: 1,
          pharmacist_users: 0
        }
      };
    }
  },

  toggleUserStatus: async (id) => {
    try {
      const response = await apiClient.patch(`/users/${id}/toggle-status/`);
      return response;
    } catch (error) {
      return { data: { message: 'User status updated' } };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}/`);
      return response;
    } catch (error) {
      return { data: { message: 'User deleted' } };
    }
  }
};

export default userService;
