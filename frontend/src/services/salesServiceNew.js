import { apiClient } from './apiClient';

// NEW SALES SERVICE - 2025-07-17-17:30
const salesServiceNew = {
  getAllSales: async (params = {}) => {
    console.log('✅ NEW getAllSales method called - working!');
    try {
      const response = await apiClient.get('/sales/sales/', { params });
      let sales = [];
      if (Array.isArray(response.data)) {
        sales = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        sales = response.data.results;
      }
      console.log(`✅ Loaded ${sales.length} sales from NEW service`);
      return sales;
    } catch (error) {
      console.error('❌ Error fetching sales from NEW service:', error);
      throw error;
    }
  },

  createSale: async (data) => {
    try {
      console.log('📤 Creating sale with NEW service:', data);
      const response = await apiClient.post('/sales/sales/', data);
      console.log('✅ Sale created successfully with NEW service:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating sale with NEW service:', error);
      throw error;
    }
  },

  getSale: async (id) => {
    try {
      const response = await apiClient.get(`/sales/sales/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  },

  updateSale: async (id, data) => {
    try {
      const response = await apiClient.put(`/sales/sales/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  },

  deleteSale: async (id) => {
    try {
      await apiClient.delete(`/sales/sales/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  },

  // Additional method to get sale with full details including items
  getSaleDetails: async (id) => {
    try {
      console.log(`🔍 Fetching sale details for ID: ${id}`);
      const response = await apiClient.get(`/sales/sales/${id}/`);
      console.log('✅ Sale details received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching sale details:', error);
      throw error;
    }
  },

  // Get sale items for a specific sale
  getSaleItems: async (saleId) => {
    try {
      const response = await apiClient.get(`/sales/sale-items/?sale=${saleId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching sale items:', error);
      throw error;
    }
  }
};

console.log('🔍 NEW SalesService module loaded with methods:', Object.keys(salesServiceNew));
console.log('🔍 NEW getAllSales method exists:', typeof salesServiceNew.getAllSales === 'function');

export default salesServiceNew;
