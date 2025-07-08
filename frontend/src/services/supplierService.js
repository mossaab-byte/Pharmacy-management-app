import { apiClient } from './apiClient';

const supplierService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/suppliers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      // Return mock data on error
      return [
        {
          id: 1,
          name: 'MedSupply Co.',
          email: 'contact@medsupply.com',
          phone: '+1-555-0123',
          address: '123 Medical St, Healthcare City',
          contact_person: 'John Smith'
        },
        {
          id: 2,
          name: 'PharmaDistributors',
          email: 'info@pharmadist.com',
          phone: '+1-555-0456',
          address: '456 Pharma Ave, Medicine Town',
          contact_person: 'Jane Doe'
        },
        {
          id: 3,
          name: 'HealthCorp Supplies',
          email: 'sales@healthcorp.com',
          phone: '+1-555-0789',
          address: '789 Health Blvd, Wellness City',
          contact_person: 'Mike Johnson'
        }
      ];
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/suppliers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return {
        id: id,
        name: 'MedSupply Co.',
        email: 'contact@medsupply.com',
        phone: '+1-555-0123',
        address: '123 Medical St, Healthcare City',
        contact_person: 'John Smith'
      };
    }
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post('/suppliers/', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/suppliers/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      const response = await apiClient.delete(`/suppliers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  },

  // Extra endpoints
  getSupplierTransactions: async (id) => {
    try {
      const response = await apiClient.get(`/suppliers/${id}/transactions/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier transactions:', error);
      return [];
    }
  },

  getPurchaseHistory: async (id) => {
    try {
      const response = await apiClient.get(`/suppliers/${id}/purchases/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      return [];
    }
  },

  getSupplierProducts: async (id) => {
    try {
      const response = await apiClient.get(`/suppliers/${id}/products/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      return [];
    }
  },

  recordPayment: async (id, payload) => {
    try {
      const response = await apiClient.post(`/suppliers/${id}/payments/`, payload);
      return response.data;
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    }
  }
};

export default supplierService;