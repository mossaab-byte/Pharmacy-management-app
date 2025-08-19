import { apiClient } from './apiClient';

const authService = {
  registerUser: (payload) => apiClient.post('register-user/', payload).then(res => res.data),

  login: (payload) => apiClient.post('token/', payload).then(res => res.data),

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/current-user/');
      return response.data;
    } catch (error) {
      // Fallback to old endpoint if new one doesn't exist
      const response = await apiClient.get('/auth/me/');
      return response.data;
    }
  },

  logout: async () => {
    await apiClient.post('/auth/logout/');
  },

  registerPharmacy: (payload) => apiClient.post('/pharmacies/register/', payload).then(res => res.data),

  // Vérifier si l'utilisateur est pharmacien (a tous les droits)
  isPharmacist: async () => {
    try {
      const user = await authService.getCurrentUser();
      return user.is_pharmacist || false;
    } catch (error) {
      return false;
    }
  },

  // Vérifier les permissions de l'utilisateur
  getUserPermissions: async () => {
    try {
      const user = await authService.getCurrentUser();
      
      // Si c'est un pharmacien, il a toutes les permissions
      if (user.is_pharmacist) {
        return {
          can_manage_inventory: true,
          can_manage_sales: true,
          can_manage_purchases: true,
          can_manage_users: true,
          can_view_reports: true,
        };
      }
      
      // Sinon, retourner les permissions spécifiques
      return user.permissions || {
        can_manage_inventory: false,
        can_manage_sales: true, // Permission de base
        can_manage_purchases: false,
        can_manage_users: false,
        can_view_reports: false,
      };
    } catch (error) {
      console.error('Erreur récupération permissions:', error);
      return {
        can_manage_inventory: false,
        can_manage_sales: true,
        can_manage_purchases: false,
        can_manage_users: false,
        can_view_reports: false,
      };
    }
  }
};

export default authService;
