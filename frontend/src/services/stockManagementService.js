import { apiClient } from './apiClient';

const stockManagementService = {
  // Obtenir les permissions de l'utilisateur
  getUserPermissions: async () => {
    try {
      const response = await apiClient.get('/inventory/user/permissions/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  // Ajouter du stock manuellement
  addStock: async (pharmacyMedicineId, quantity, reason = 'MANUAL_ADD', notes = '') => {
    try {
      const response = await apiClient.post(
        `/pharmacy/pharmacy-medicines/${pharmacyMedicineId}/manual-stock-add/`, 
        {
          quantity: quantity,
          reason: reason,
          notes: notes
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  },

  // Réduire le stock manuellement
  reduceStock: async (pharmacyMedicineId, quantity, reason = 'MANUAL_REDUCE', notes = '') => {
    try {
      const response = await apiClient.post(
        `/pharmacy/pharmacy-medicines/${pharmacyMedicineId}/reduce_stock/`, 
        {
          amount: quantity,
          reason: `${reason}: ${notes}` || reason
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error reducing stock:', error);
      throw error;
    }
  },

  // Obtenir les médicaments avec stock faible
  getLowStockMedicines: async (threshold = 10) => {
    try {
      const response = await apiClient.get(`/pharmacy/pharmacy-medicines/low-stock/?threshold=${threshold}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
      throw error;
    }
  },

  // Obtenir l'historique des mouvements de stock
  getStockHistory: async (pharmacyMedicineId) => {
    try {
      const response = await apiClient.get(`/inventory/logs/?pharmacy_medicine=${pharmacyMedicineId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw error;
    }
  },

  // Vérifier les permissions pour la gestion du stock
  checkStockPermissions: async () => {
    try {
      const response = await apiClient.get('/users/current-user/');
      const user = response.data;
      
      return {
        canManageInventory: user.permissions?.can_manage_inventory || user.is_pharmacist || false,
        isPharmacist: user.is_pharmacist || false,
        isManager: user.is_manager || false,
        permissions: user.permissions || {}
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        canManageInventory: false,
        isPharmacist: false,
        isManager: false,
        permissions: {}
      };
    }
  }
};

export default stockManagementService;
