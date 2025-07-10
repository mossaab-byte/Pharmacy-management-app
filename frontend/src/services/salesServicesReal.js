import { apiClient } from './apiClient';

const SalesService = {
  // Get all sales from Django backend - REAL DATA ONLY
  getAllSales: async (params = {}) => {
    try {
      console.log('🔗 Fetching sales from Django backend...');
      const response = await apiClient.get('/sales/sales/', { params });
      console.log(`✅ Loaded ${response.data?.results?.length || response.data?.length || 0} sales from Django`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching sales from Django backend:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Make sure Django backend is running on http://localhost:8000');
      throw error; // No fallback - force real connection
    }
  },

  // Create a new sale - REAL DATA ONLY  
  createSale: async (saleData) => {
    try {
      console.log('💾 Creating sale in Django backend:', saleData);
      const response = await apiClient.post('/sales/sales/', saleData);
      console.log('✅ Sale created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error creating sale in Django backend:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error; // No fallback - must save to real database
    }
  },

  // Get sale by ID - REAL DATA ONLY
  getSaleById: async (id) => {
    try {
      console.log(`🔗 Fetching sale ${id} from Django backend...`);
      const response = await apiClient.get(`/sales/sales/${id}/`);
      console.log('✅ Sale loaded:', response.data);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching sale ${id}:`, error);
      throw error;
    }
  },

  // Update sale - REAL DATA ONLY
  updateSale: async (id, saleData) => {
    try {
      console.log(`💾 Updating sale ${id} in Django backend:`, saleData);
      const response = await apiClient.put(`/sales/sales/${id}/`, saleData);
      console.log('✅ Sale updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error(`❌ Error updating sale ${id}:`, error);
      throw error;
    }
  },

  // Delete sale - REAL DATA ONLY
  deleteSale: async (id) => {
    try {
      console.log(`🗑️ Deleting sale ${id} from Django backend...`);
      const response = await apiClient.delete(`/sales/sales/${id}/`);
      console.log('✅ Sale deleted successfully');
      return response;
    } catch (error) {
      console.error(`❌ Error deleting sale ${id}:`, error);
      throw error;
    }
  },

  // Get sales statistics - REAL DATA ONLY
  getSalesStats: async (params = {}) => {
    try {
      console.log('📊 Fetching sales statistics from Django backend...');
      const response = await apiClient.get('/sales/sales/stats/', { params });
      console.log('✅ Sales stats loaded:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching sales statistics:', error);
      throw error;
    }
  }
};

export default SalesService;
