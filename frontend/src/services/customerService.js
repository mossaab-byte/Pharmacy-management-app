import { apiClient } from './apiClient';

const customerService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/sales/customers/');
      // Handle paginated response
      let customers = [];
      if (Array.isArray(response.data)) {
        customers = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        customers = response.data.results;
      }
      console.log(`✅ Loaded ${customers.length} customers`);
      return customers;
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/sales/customers/${id}/`);
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
      const response = await apiClient.post('/sales/customers/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/sales/customers/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  remove: async (id) => {
    try {
      await apiClient.delete(`/sales/customers/${id}/`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },
  
  // Get customer sales history
  getSales: async (customerId) => {
    try {
      const response = await apiClient.get(`/sales/customers/${customerId}/sales/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer sales:', error);
      return [];
    }
  },
  
  // Get customer payment history
  getPayments: async (customerId) => {
    try {
      const response = await apiClient.get(`/sales/customers/${customerId}/payments/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer payments:', error);
      return [];
    }
  }
};

export default customerService;