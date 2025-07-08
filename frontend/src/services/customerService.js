import { apiClient } from './apiClient';

const customerService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/api/customers/');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      // Return mock data on error
      return [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-0123',
          address: '123 Main St, City, State'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-0456',
          address: '456 Oak Ave, City, State'
        }
      ];
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/customers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return {
        id: id,
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '+1-555-0123',
        address: '123 Main St, City, State'
      };
    }
  },

  create: async (data) => {
    try {
      const response = await apiClient.post('/api/customers/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/api/customers/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      await apiClient.delete(`/api/customers/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },
  
  // Get customer sales history
  getSales: async (customerId) => {
    try {
      const response = await apiClient.get(`/api/customers/${customerId}/sales/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer sales:', error);
      return [];
    }
  },
  
  // Get customer payment history
  getPayments: async (customerId) => {
    try {
      const response = await apiClient.get(`/api/customers/${customerId}/payments/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      return [];
    }
  }
};

export default customerService;