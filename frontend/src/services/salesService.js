import { apiClient } from './apiClient';

const salesService = {
  // Créer une nouvelle vente
  createSale: async (saleData) => {
    try {
      const response = await apiClient.post('/sales/sales/', saleData);
      return response.data;
    } catch (error) {
      console.error('Erreur création vente:', error);
      throw error;
    }
  },

  // Obtenir toutes les ventes
  getAllSales: async () => {
    try {
      console.log('📞 Sales Service: Fetching all sales from /sales/sales/');
      const response = await apiClient.get('/sales/sales/');
      console.log('📞 Sales Service: Response received:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Sales Service Error:', error.response?.status, error.response?.data);
      console.error('❌ Full error:', error);
      throw error;
    }
  },

  // Obtenir une vente par ID
  getSaleById: async (id) => {
    try {
      const response = await apiClient.get(`/sales/sales/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération vente:', error);
      throw error;
    }
  },

  // Supprimer une vente
  deleteSale: async (id) => {
    try {
      const response = await apiClient.delete(`/sales/sales/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur suppression vente:', error);
      throw error;
    }
  }
};

export default salesService;
