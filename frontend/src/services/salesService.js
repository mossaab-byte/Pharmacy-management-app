import { apiClient } from './apiClient';

const salesService = {
  // Créer une nouvelle vente
  createSale: async (saleData) => {
    try {
      const response = await apiClient.post('/sales/', saleData);
      return response.data;
    } catch (error) {
      console.error('Erreur création vente:', error);
      throw error;
    }
  },

  // Obtenir toutes les ventes
  getAllSales: async () => {
    try {
      const response = await apiClient.get('/sales/');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération ventes:', error);
      throw error;
    }
  },

  // Obtenir une vente par ID
  getSaleById: async (id) => {
    try {
      const response = await apiClient.get(`/sales/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur récupération vente:', error);
      throw error;
    }
  },

  // Supprimer une vente
  deleteSale: async (id) => {
    try {
      const response = await apiClient.delete(`/sales/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Erreur suppression vente:', error);
      throw error;
    }
  }
};

export default salesService;
