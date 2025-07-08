import { apiClient } from './apiClient';

const inventoryService = {
  // Get pharmacy inventory (PharmacyMedicine items)
  getInventory: async (params = {}) => {
    const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { params });
    return response;
  },

  // Get inventory logs
  getInventoryLogs: async (params = {}) => {
    const response = await apiClient.get('/inventory/logs/', { params });
    return response;
  },

  // Get stock history for specific medicine
  getSingleInventoryLogs: async (pharmacyMedicineId) => {
    const response = await apiClient.get(`/pharmacy/pharmacy-medicines/${pharmacyMedicineId}/stock_history/`);
    return response;
  },

  // Add medicine to pharmacy inventory
  addMedicine: async (data) => {
    const response = await apiClient.post('/pharmacy/pharmacy-medicines/', data);
    return response;
  },

  // Add stock to existing medicine
  addStock: async (id, data) => {
    const response = await apiClient.post(`/pharmacy/pharmacy-medicines/${id}/add_stock/`, data);
    return response;
  },

  // Remove stock from medicine
  removeStock: async (id, data) => {
    const response = await apiClient.post(`/pharmacy/pharmacy-medicines/${id}/reduce_stock/`, data);
    return response;
  },

  // Get low stock items
  getLowStockItems: async () => {
    const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { 
      params: { low_stock: true } 
    });
    return response;
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { 
      params: { stats: true } 
    });
    return response;
  },

  // Update stock (legacy method)
  updateStock: async (data) => {
    const response = await apiClient.post('/pharmacy/pharmacy-medicines/update-stock/', data);
    return response;
  }
};

export default inventoryService;
