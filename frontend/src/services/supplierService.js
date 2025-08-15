import { apiClient } from './apiClient';

const supplierService = {

  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/purchases/suppliers/', { params });
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
      console.error('Error fetching suppliers:', error);
      throw new Error(`Failed to fetch suppliers: ${error.response?.data?.detail || error.message}`);
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/suppliers/${id}/`);
      console.log('Supplier loaded successfully:', response.data?.name);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw new Error(`Failed to fetch supplier: ${error.response?.data?.detail || error.message}`);
    }
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post('/purchases/suppliers/', payload);
      console.log('Supplier created successfully:', response.data?.name);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw new Error(`Failed to create supplier: ${error.response?.data?.detail || error.message}`);
    }
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/purchases/suppliers/${id}/`, payload);
      console.log('Supplier updated successfully:', response.data?.name);
      return response.data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw new Error(`Failed to update supplier: ${error.response?.data?.detail || error.message}`);
    }
  },

  recordPayment: async (id, payload) => {
    try {
      const response = await apiClient.post(`/purchases/suppliers/${id}/payments/`, payload);
      console.log('Payment recorded successfully');
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw new Error(`Failed to record payment: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Alias pour delete (compatibilité avec notre composant)
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/purchases/suppliers/${id}/`);
      console.log('Supplier deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(`Failed to delete supplier: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Alias for remove
  remove: async (id) => {
    return supplierService.delete(id);
  },

  // Méthode pour ajuster le solde du fournisseur
  adjustBalance: async (id, payload) => {
    try {
      const response = await apiClient.post(`/purchases/suppliers/${id}/adjust-balance/`, payload);
      console.log('Supplier balance adjusted successfully');
      return response.data;
    } catch (error) {
      console.error('Error adjusting supplier balance:', error);
      throw new Error(`Failed to adjust supplier balance: ${error.response?.data?.detail || error.message}`);
    }
  }
};

export default supplierService;