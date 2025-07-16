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
      throw error;
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
  },

  // Update customer
  update: async (customerId, customerData) => {
    try {
      const response = await apiClient.put(`/sales/customers/${customerId}/`, customerData);
      console.log('✅ Customer updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  delete: async (customerId) => {
    try {
      await apiClient.delete(`/sales/customers/${customerId}/`);
      console.log('✅ Customer deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting customer:', error);
      throw error;
    }
  },

  // Adjust customer credit
  adjustCredit: async (customerId, amount, type) => {
    try {
      const response = await apiClient.post(`/sales/customers/${customerId}/adjust-credit/`, {
        amount: amount,
        type: type // 'payment' or 'credit'
      });
      console.log('✅ Credit adjusted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error adjusting credit:', error);
      throw error;
    }
  }
};

export default customerService;