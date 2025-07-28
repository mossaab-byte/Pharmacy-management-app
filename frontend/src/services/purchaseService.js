import { apiClient } from './apiClient';

const purchaseService = {
  // ...other methods...

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

  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/purchases/purchases/', { params });
      // Always return the paginated response structure
      if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        return response.data;
      }
      // Fallback for legacy responses
      return {
        results: Array.isArray(response.data) ? response.data : [],
        total: Array.isArray(response.data) ? response.data.length : 0,
        page: 1,
        page_size: Array.isArray(response.data) ? response.data.length : 0
      };
    } catch (error) {
      console.error('Error fetching purchases:', error);
      throw new Error(`Failed to fetch purchases: ${error.response?.data?.detail || error.message}`);
    }
  }
};

export default purchaseService;