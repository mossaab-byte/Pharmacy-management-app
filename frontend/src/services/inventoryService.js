import { apiClient } from './apiClient';

const inventoryService = {
  // Get pharmacy inventory (PharmacyMedicine items)
  getInventory: async (params = {}) => {
    try {
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { params });
      console.log('Inventory loaded successfully:', response.data?.length || response.data?.results?.length || 0, 'items');
      return response;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw new Error(`Failed to fetch inventory: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get inventory logs
  getInventoryLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/inventory/logs/', { params });
      console.log('Inventory logs loaded successfully:', response.data?.length || response.data?.results?.length || 0, 'logs');
      return response;
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      throw new Error(`Failed to fetch inventory logs: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get stock history for specific medicine
  getSingleInventoryLogs: async (pharmacyMedicineId) => {
    try {
      const response = await apiClient.get(`/pharmacy/pharmacy-medicines/${pharmacyMedicineId}/stock_history/`);
      console.log('Stock history loaded successfully for medicine:', pharmacyMedicineId);
      return response;
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw new Error(`Failed to fetch stock history: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Add medicine to pharmacy inventory
  addMedicine: async (data) => {
    try {
      const response = await apiClient.post('/pharmacy/pharmacy-medicines/', data);
      console.log('Medicine added to inventory successfully:', response.data?.id);
      return response;
    } catch (error) {
      console.error('Error adding medicine to inventory:', error);
      throw new Error(`Failed to add medicine to inventory: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Add stock to existing medicine
  addStock: async (id, data) => {
    try {
      const response = await apiClient.post(`/pharmacy/pharmacy-medicines/${id}/add_stock/`, data);
      console.log('Stock added successfully for medicine:', id);
      return response;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw new Error(`Failed to add stock: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Remove stock from medicine
  removeStock: async (id, data) => {
    try {
      const response = await apiClient.post(`/pharmacy/pharmacy-medicines/${id}/reduce_stock/`, data);
      console.log('Stock reduced successfully for medicine:', id);
      return response;
    } catch (error) {
      console.error('Error reducing stock:', error);
      throw new Error(`Failed to reduce stock: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get low stock items
  getLowStockItems: async () => {
    try {
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { 
        params: { low_stock: true } 
      });
      console.log('Low stock items loaded successfully:', response.data?.length || response.data?.results?.length || 0, 'items');
      return response;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw new Error(`Failed to fetch low stock items: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { 
        params: { stats: true } 
      });
      console.log('Inventory statistics loaded successfully');
      return response;
    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
      throw new Error(`Failed to fetch inventory statistics: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Update stock (legacy method)
  updateStock: async (data) => {
    try {
      const response = await apiClient.post('/pharmacy/pharmacy-medicines/update-stock/', data);
      console.log('Stock updated successfully via legacy method');
      return response;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error(`Failed to update stock: ${error.response?.data?.detail || error.message}`);
    }
  }
};

export default inventoryService;
