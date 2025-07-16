import { apiClient } from './apiClient';

const creditService = {
  // Obtenir le solde et les informations de crédit d'un client
  getCustomerBalance: async (customerId) => {
    try {
      const response = await apiClient.get(`/sales/customers/${customerId}/`);
      const customer = response.data;
      return {
        balance: customer.balance || 0,
        credit_limit: customer.credit_limit || 5000,
        available_credit: (customer.credit_limit || 5000) - (customer.balance || 0)
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du solde client:', error);
      throw error;
    }
  },

  // Vérifier si un client peut acheter à crédit
  canBuyOnCredit: async (customerId, amount) => {
    try {
      const balanceInfo = await this.getCustomerBalance(customerId);
      
      return {
        canBuy: (balanceInfo.balance + amount) <= balanceInfo.credit_limit,
        currentBalance: balanceInfo.balance,
        creditLimit: balanceInfo.credit_limit,
        availableCredit: balanceInfo.available_credit,
        requestedAmount: amount
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du crédit:', error);
      throw error;
    }
  },

  // Créer un nouveau crédit client
  createCredit: async (creditData) => {
    try {
      const response = await apiClient.post('/credits/', creditData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du crédit:', error);
      throw error;
    }
  },

  // Obtenir tous les crédits
  getCredits: async () => {
    try {
      const response = await apiClient.get('/credits/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des crédits:', error);
      return [];
    }
  },

  // Obtenir les crédits d'un client spécifique
  getCustomerCredits: async (customerId) => {
    try {
      const response = await apiClient.get(`/credits/?customer=${customerId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des crédits du client:', error);
      return [];
    }
  },

  // Effectuer un paiement sur un crédit
  makePayment: async (creditId, paymentData) => {
    try {
      const response = await apiClient.post(`/credits/${creditId}/payments/`, paymentData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors du paiement:', error);
      throw error;
    }
  },

  // Obtenir l'historique des paiements d'un crédit
  getPaymentHistory: async (creditId) => {
    try {
      const response = await apiClient.get(`/credits/${creditId}/payments/`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique des paiements:', error);
      return [];
    }
  },

  // Marquer un crédit comme payé
  markAsPaid: async (creditId) => {
    try {
      const response = await apiClient.patch(`/credits/${creditId}/`, { is_paid: true });
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors du marquage comme payé:', error);
      throw error;
    }
  }
};

export default creditService;
