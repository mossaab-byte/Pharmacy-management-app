import { apiClient } from './apiClient';

const supplierService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/purchases/suppliers/');
      // Handle paginated response
      let suppliers = [];
      if (Array.isArray(response.data)) {
        suppliers = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        suppliers = response.data.results;
      }
      console.log('Suppliers loaded successfully:', suppliers.length, 'suppliers');
      return suppliers;
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

  remove: async (id) => {
    try {
      const response = await apiClient.delete(`/purchases/suppliers/${id}/`);
      console.log('Supplier deleted successfully');
      return response.data;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw new Error(`Failed to delete supplier: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Extra endpoints
  getSupplierTransactions: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/suppliers/${id}/transactions/`);
      console.log('Supplier transactions loaded successfully:', response.data?.length || 0, 'transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier transactions:', error);
      throw new Error(`Failed to fetch supplier transactions: ${error.response?.data?.detail || error.message}`);
    }
  },

  getPurchaseHistory: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/suppliers/${id}/purchases/`);
      console.log('Purchase history loaded successfully:', response.data?.length || 0, 'purchases');
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw new Error(`Failed to fetch purchase history: ${error.response?.data?.detail || error.message}`);
    }
  },

  getSupplierProducts: async (id) => {
    try {
      const response = await apiClient.get(`/purchases/suppliers/${id}/products/`);
      console.log('Supplier products loaded successfully:', response.data?.length || 0, 'products');
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      throw new Error(`Failed to fetch supplier products: ${error.response?.data?.detail || error.message}`);
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
  }
};

export default supplierService;