import { apiClient } from './apiClient';

const inventoryService = {
  // Get pharmacy inventory (PharmacyMedicine items)
  getInventory: async (params = {}) => {
    try {
      console.log('🔍 Fetching inventory from:', '/pharmacy/pharmacy-medicines/full-inventory/');
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/full-inventory/', { params });
      console.log('📦 Full inventory response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching inventory:', error);
      throw new Error(`Failed to fetch inventory: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get full inventory without pagination for global sorting
  getAllInventory: async () => {
    try {
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/full-inventory/');
      return response;
    } catch (error) {
      console.error('Error fetching all inventory:', error);
      throw new Error(`Failed to fetch inventory: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get inventory logs
  getInventoryLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/pharmacy/inventory-logs/', { params });
      return response;
    } catch (error) {
      console.error('Error fetching inventory logs:', error);
      throw new Error(`Failed to fetch inventory logs: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get single inventory logs
  getSingleInventoryLogs: async (pharmacyMedicineId) => {
    try {
      const response = await apiClient.get(`/pharmacy/inventory-logs/?pharmacy_medicine=${pharmacyMedicineId}`);
      return response;
    } catch (error) {
      console.error('Error fetching single inventory logs:', error);
      throw new Error(`Failed to fetch inventory logs: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Add medicine to pharmacy inventory using bulk-add endpoint
  addMedicineToPharmacy: async (medicineId, quantity = 0, reason = 'Initial stock') => {
    try {
      console.log('🏥 Adding medicine to pharmacy inventory:', { medicineId, quantity, reason });
      
      const data = [{
        medicine_id: medicineId,
        quantity: quantity,
        reason: reason
      }];
      
      const response = await apiClient.post('/pharmacy/pharmacy-medicines/bulk-add/', data);
      console.log('✅ Medicine added to pharmacy inventory successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Error adding medicine to pharmacy:', error);
      throw new Error(`Failed to add medicine to pharmacy: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Add medicine to pharmacy (legacy endpoint)
  addMedicine: async (data) => {
    try {
      const response = await apiClient.post('/pharmacy/pharmacy-medicines/', data);
      console.log('Medicine added successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error adding medicine:', error);
      throw new Error(`Failed to add medicine: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Add stock to existing medicine
  addStock: async (pharmacyMedicineId, data) => {
    try {
      console.log('🔄 Adding stock to pharmacy-medicine ID:', pharmacyMedicineId, 'with data:', data);
      
      // Use the correct pharmacy-medicines endpoint
      const response = await apiClient.post(`/pharmacy/pharmacy-medicines/${pharmacyMedicineId}/add_stock/`, data);
      console.log('✅ Stock added successfully for pharmacy-medicine ID:', pharmacyMedicineId);
      return response;
    } catch (error) {
      console.error('❌ Error adding stock:', error);
      throw new Error(`Failed to add stock: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Remove stock from existing medicine
  removeStock: async (pharmacyMedicineId, data) => {
    try {
      console.log('🔄 Removing stock from pharmacy-medicine ID:', pharmacyMedicineId, 'with data:', data);
      
      const response = await apiClient.post(`/pharmacy/pharmacy-medicines/${pharmacyMedicineId}/reduce_stock/`, data);
      console.log('✅ Stock removed successfully from pharmacy-medicine ID:', pharmacyMedicineId);
      return response;
    } catch (error) {
      console.error('❌ Error removing stock:', error);
      throw new Error(`Failed to remove stock: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get low stock items (optional endpoint)
  getLowStockItems: async () => {
    try {
      const response = await apiClient.get('/pharmacy/low-stock/');
      console.log('Low stock items loaded successfully:', response.data.length, 'items');
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('Low stock endpoint not available, skipping...');
        // Return empty data structure instead of throwing
        return { data: [] };
      }
      console.error('Error fetching low stock items:', error);
      throw new Error(`Failed to fetch low stock items: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Get inventory statistics (optional endpoint)
  getInventoryStats: async () => {
    try {
      const response = await apiClient.get('/pharmacy/inventory-stats/');
      console.log('Inventory statistics loaded successfully');
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn('Inventory stats endpoint not available, skipping...');
        // Return empty data structure instead of throwing
        return { data: { total_items: 0, low_stock_count: 0, out_of_stock_count: 0 } };
      }
      console.error('Error fetching inventory stats:', error);
      throw new Error(`Failed to fetch inventory stats: ${error.response?.data?.detail || error.message}`);
    }
  },

  // Update stock for multiple medicines
  updateStock: async (data) => {
    try {
      const response = await apiClient.post('/pharmacy/update-stock/', data);
      console.log('Stock updated successfully');
      return response;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error(`Failed to update stock: ${error.response?.data?.detail || error.message}`);
    }
  }
};

export default inventoryService;