import { apiClient } from './apiClient'; // Your configured axios instance

const ExchangeService = {
  // Create a new exchange request
  createExchange: (data) => {
    return apiClient.post('exchange/create/', data);
  },

  // Get list of exchanges with optional filters
  getExchanges: (params = {}) => {
    return apiClient.get('exchange/list/', { params });
  },

  // Get partner pharmacies
  getPartnerPharmacies: () => {
    return apiClient.get('exchange/partners/');
  },

  // Perform actions on exchanges (approve/reject/cancel)
  performExchangeAction: (exchangeId, action, data = {}) => {
    return apiClient.post(`exchange/${exchangeId}/action/${action}/`, data);
  },

  // Process an approved exchange
  processExchange: (exchangeId) => {
    return apiClient.post(`exchange/${exchangeId}/process/`);
  },

  // Get exchange balances
  getExchangeBalances: () => {
    return apiClient.get('exchange/balance/');
  },

  // Get exchange history with a specific pharmacy
  getExchangeHistory: (pharmacyId) => {
    return apiClient.get(`exchange/history/${pharmacyId}/`);
  },

  // Get pharmacy details
  getPharmacyDetails: (pharmacyId) => {
    return apiClient.get(`pharmacy/${pharmacyId}/`);
  },

  // Get medicines list (for selector)
  getMedicines: (params = {}) => {
    return apiClient.get('medicines/', { params });
  }
};

export default ExchangeService;