import { apiClient } from './apiClient';

const supplierService = {

  getAll: async (params = {}) => {
    try {
      // Add cache-busting parameter instead of headers
      const response = await apiClient.get('/purchases/suppliers/', { 
        params: {
          ...params,
          _t: Date.now() // Cache buster
        }
      });
      
      console.log('🔍 SUPPLIER SERVICE: Raw API response:', response.data);
      
      // Always return the paginated response structure
      if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        console.log('🔍 SUPPLIER SERVICE: Found results array with', response.data.results.length, 'suppliers');
        if (response.data.results.length > 0) {
          const firstSupplier = response.data.results[0];
          console.log('🔍 SUPPLIER SERVICE: First supplier:', {
            name: firstSupplier.name,
            credit_limit: firstSupplier.credit_limit,
            current_balance: firstSupplier.current_balance
          });
        }
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

  // Get supplier transactions
  getTransactions: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/suppliers/${id}/transactions/`);
      console.log('Supplier transactions loaded successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier transactions:', error);
      throw new Error(`Failed to fetch supplier transactions: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Record payment to supplier
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

  // Reduce supplier credit by a specific amount
  reduceCredit: async (id, payload) => {
    try {
      const response = await apiClient.post(`/purchases/suppliers/${id}/reduce_credit/`, payload);
      console.log('Credit reduced successfully');
      return response.data;
    } catch (error) {
      console.error('Error reducing credit:', error);
      throw new Error(`Failed to reduce credit: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Reset supplier credit to zero
  resetCredit: async (id, payload) => {
    try {
      const response = await apiClient.post(`/purchases/suppliers/${id}/reset_credit/`, payload);
      console.log('Credit reset successfully');
      return response.data;
    } catch (error) {
      console.error('Error resetting credit:', error);
      throw new Error(`Failed to reset credit: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get supplier purchases
  getPurchases: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/suppliers/${id}/purchases/`);
      console.log('Supplier purchases loaded successfully');
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier purchases:', error);
      throw new Error(`Failed to fetch supplier purchases: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Delete supplier
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

  // Adjust supplier balance
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