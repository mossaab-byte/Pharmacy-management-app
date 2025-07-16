import { apiClient } from './apiClient';

const userManagementService = {
  // Obtenir tous les utilisateurs de la pharmacie
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/users/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Obtenir les informations de l'utilisateur actuel
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/current-user/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  // Mettre à jour les permissions d'un utilisateur
  updateUserPermissions: async (userId, permissions) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/permissions/`, permissions);
      return response.data;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  },

  // Basculer le statut de manager
  toggleManagerStatus: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/toggle-manager/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling manager status:', error);
      throw error;
    }
  },

  // Obtenir un utilisateur par ID
  getUserById: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

export default userManagementService;
