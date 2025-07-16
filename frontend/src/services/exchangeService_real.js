import { apiClient } from './apiClient';

const exchangeService = {
  // Obtenir les données d'échange de médicaments
  getExchangeData: async () => {
    try {
      const response = await apiClient.get('/exchanges/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données d\'échange:', error);
      return [];
    }
  },

  // Créer une nouvelle demande d'échange
  createExchangeRequest: async (exchangeData) => {
    try {
      const response = await apiClient.post('/exchanges/', exchangeData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la demande d\'échange:', error);
      throw error;
    }
  },

  // Obtenir les pharmacies partenaires
  getPartnerPharmacies: async () => {
    try {
      const response = await apiClient.get('/pharmacies/partners/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des pharmacies partenaires:', error);
      return [];
    }
  },

  // Obtenir les médicaments disponibles pour échange
  getAvailableMedicines: async (pharmacyId) => {
    try {
      const response = await apiClient.get(`/pharmacies/${pharmacyId}/medicines/available-for-exchange/`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des médicaments disponibles:', error);
      return [];
    }
  },

  // Accepter une demande d'échange
  acceptExchangeRequest: async (exchangeId) => {
    try {
      const response = await apiClient.patch(`/exchanges/${exchangeId}/accept/`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de l\'acceptation de l\'échange:', error);
      throw error;
    }
  },

  // Rejeter une demande d'échange
  rejectExchangeRequest: async (exchangeId, reason) => {
    try {
      const response = await apiClient.patch(`/exchanges/${exchangeId}/reject/`, { reason });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors du rejet de l\'échange:', error);
      throw error;
    }
  }
};

export default exchangeService;
