import { apiClient } from './apiClient';

const PurchaseService = {
  // Get all purchases from Django backend - REAL DATA ONLY
  getAllPurchases: async (params = {}) => {
    try {
      console.log('🔗 Fetching purchases from Django backend...');
      const response = await apiClient.get('/purchases/purchases/', { params });
      console.log(`✅ Loaded ${response.data?.results?.length || response.data?.length || 0} purchases from Django`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching purchases from Django backend:', error);
      console.error('Error details:', error.response?.data || error.message);
      console.error('Make sure Django backend is running on http://localhost:8000');
      throw error; // No fallback - force real connection
    }
  },

  // Create a new purchase - REAL DATA ONLY  
  createPurchase: async (purchaseData) => {
    try {
      console.log('💾 Creating purchase in Django backend:', purchaseData);
      const response = await apiClient.post('/purchases/purchases/', purchaseData);
      console.log('✅ Purchase created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error creating purchase in Django backend:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw error; // No fallback - must save to real database
    }
  },

  // Get purchase by ID - REAL DATA ONLY
  getPurchaseById: async (id) => {
    try {
      console.log(`🔗 Fetching purchase ${id} from Django backend...`);
      const response = await apiClient.get(`/purchases/purchases/${id}/`);
      console.log('✅ Purchase loaded:', response.data);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching purchase ${id}:`, error);
      throw error;
    }
  },

  // Update purchase - REAL DATA ONLY
  updatePurchase: async (id, purchaseData) => {
    try {
      console.log(`💾 Updating purchase ${id} in Django backend:`, purchaseData);
      const response = await apiClient.put(`/purchases/purchases/${id}/`, purchaseData);
      console.log('✅ Purchase updated successfully:', response.data);
      return response;
    } catch (error) {
      console.error(`❌ Error updating purchase ${id}:`, error);
      throw error;
    }
  },

  // Delete purchase - REAL DATA ONLY
  deletePurchase: async (id) => {
    try {
      console.log(`🗑️ Deleting purchase ${id} from Django backend...`);
      const response = await apiClient.delete(`/purchases/purchases/${id}/`);
      console.log('✅ Purchase deleted successfully');
      return response;
    } catch (error) {
      console.error(`❌ Error deleting purchase ${id}:`, error);
      throw error;
    }
  },

  // Get purchase statistics - REAL DATA ONLY
  getPurchaseStats: async (params = {}) => {
    try {
      console.log('📊 Fetching purchase statistics from Django backend...');
      const response = await apiClient.get('/purchases/purchases/stats/', { params });
      console.log('✅ Purchase stats loaded:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error fetching purchase statistics:', error);
      throw error;
    }
  }
};

export default PurchaseService;
