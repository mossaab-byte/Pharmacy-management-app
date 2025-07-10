import { apiClient } from './apiClient';

const ExchangeService = {
  // Create a new exchange request
  createExchange: async (data) => {
    try {
      const response = await apiClient.post('exchange/create/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating exchange:', error);
      throw error;
    }
  },

  // Get list of exchanges with optional filters
  getExchanges: async (params = {}) => {
    try {
      const response = await apiClient.get('exchange/list/', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      // Return mock exchange data
      return [
        {
          id: 1,
          partner_pharmacy: 'Pharmacie Central',
          medicine_name: 'Doliprane 500mg',
          quantity_requested: 20,
          quantity_offered: 15,
          status: 'pending',
          created_at: '2024-01-15',
          type: 'outgoing'
        },
        {
          id: 2,
          partner_pharmacy: 'Pharmacie du Quartier',
          medicine_name: 'Aspirin 325mg',
          quantity_requested: 10,
          quantity_offered: 10,
          status: 'approved',
          created_at: '2024-01-14',
          type: 'incoming'
        }
      ];
    }
  },

  // Get partner pharmacies
  getPartnerPharmacies: async () => {
    try {
      const response = await apiClient.get('exchange/partners/');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching partner pharmacies:', error);
      // Return mock partner pharmacies
      return [
        { id: 1, name: 'Pharmacie Central', address: '123 Rue Mohammed V', phone: '0522-123456' },
        { id: 2, name: 'Pharmacie du Quartier', address: '456 Avenue Hassan II', phone: '0522-654321' },
        { id: 3, name: 'Pharmacie Al Maghrib', address: '789 Boulevard Zerktouni', phone: '0522-987654' }
      ];
    }
  },

  // Perform actions on exchanges (approve/reject/cancel)
  performExchangeAction: async (exchangeId, action, data = {}) => {
    try {
      const response = await apiClient.post(`exchange/${exchangeId}/action/${action}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error performing exchange action:', error);
      throw error;
    }
  },

  // Process an approved exchange
  processExchange: async (exchangeId) => {
    try {
      const response = await apiClient.post(`exchange/${exchangeId}/process/`);
      return response.data;
    } catch (error) {
      console.error('Error processing exchange:', error);
      throw error;
    }
  },

  // Get exchange balances
  getExchangeBalances: async () => {
    try {
      const response = await apiClient.get('exchange/balance/');
      return response.data;
    } catch (error) {
      console.error('Error fetching exchange balances:', error);
      return {
        total_given: 0,
        total_received: 0,
        pending_outgoing: 0,
        pending_incoming: 0
      };
    }
  },

  // Get exchange history with a specific pharmacy
  getExchangeHistory: async (pharmacyId) => {
    try {
      const response = await apiClient.get(`exchange/history/${pharmacyId}/`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching exchange history:', error);
      return [];
    }
  },

  // Get pharmacy details
  getPharmacyDetails: async (pharmacyId) => {
    try {
      const response = await apiClient.get(`pharmacy/${pharmacyId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacy details:', error);
      return {
        id: pharmacyId,
        name: 'Pharmacie Example',
        address: 'Unknown Address',
        phone: 'Unknown Phone'
      };
    }
  },

  // Get medicines list (for selector)
  getMedicines: async (params = {}) => {
    try {
      const response = await apiClient.get('medicines/', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching medicines for exchange:', error);
      return [];
    }
  }
};

export default ExchangeService;