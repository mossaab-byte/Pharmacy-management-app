import { apiClient } from './apiClient';

 const saleService = {
  getAllSales: async (params = {}) => {
    const response = await apiClient.get('/sales', { params });
    return response.data;
  },

  createSale: async (data) => {
    const response = await apiClient.post('/sales', data);
    return response.data;
  },

  getSale: async (id) => {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  },

  updateSale: async (id, data) => {
    const response = await apiClient.put(`/sales/${id}`, data);
    return response.data;
  }
};
export default saleService;