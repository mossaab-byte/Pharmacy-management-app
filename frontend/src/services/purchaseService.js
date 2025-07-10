import { apiClient } from './apiClient';

const purchaseService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/purchases/purchases/');
      let purchases = [];
      if (Array.isArray(response.data)) {
        purchases = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        purchases = response.data.results;
      }
      console.log(`✅ Loaded ${purchases.length} purchases from backend`);
      return purchases;
    } catch (error) {
      console.error('❌ Error fetching purchases:', error);
      throw new Error(`Failed to fetch purchases: ${error.response?.data?.detail || error.message}`);
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/purchases/${id}/`);
      console.log('Purchase loaded successfully:', response.data?.id);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase:', error);
      throw new Error(`Failed to fetch purchase: ${error.response?.data?.detail || error.message}`);
    }
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post('/purchases/purchases/', payload);
      console.log('Purchase created successfully:', response.data?.id);
      return response.data;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw new Error(`Failed to create purchase: ${error.response?.data?.detail || error.message}`);
    }
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/purchases/purchases/${id}/`, payload);
      console.log('Purchase updated successfully:', response.data?.id);
      return response.data;
    } catch (error) {
      console.error('Error updating purchase:', error);
      throw new Error(`Failed to update purchase: ${error.response?.data?.detail || error.message}`);
    }
  },

  remove: async (id) => {
    try {
      const response = await apiClient.delete(`/purchases/purchases/${id}/`);
      console.log('Purchase deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw new Error(`Failed to delete purchase: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get purchase statistics
  getStats: async () => {
    try {
      const response = await apiClient.get('/purchases/purchases/statistics/');
      console.log('Purchase statistics loaded successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase stats:', error);
      throw new Error(`Failed to fetch purchase statistics: ${error.response?.data?.detail || error.message}`);
    }
  }
};

export default purchaseService;