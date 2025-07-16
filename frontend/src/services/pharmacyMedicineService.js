import { apiClient } from './apiClient';

const pharmacyMedicineService = {
  // Obtenir tous les médicaments de la pharmacie avec stock
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { params });
      let medicines = [];
      if (Array.isArray(response.data)) {
        medicines = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        medicines = response.data.results;
      }
      console.log(`✅ Loaded ${medicines.length} pharmacy medicines`);
      return medicines;
    } catch (error) {
      console.error('❌ Error fetching pharmacy medicines:', error);
      throw error;
    }
  },

  // Rechercher des médicaments avec stock disponible
  searchAvailable: async (query = '', minStock = 1) => {
    try {
      const params = {
        search: query,
        min_quantity: minStock,
        ordering: '-quantity'
      };
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/', { params });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error searching available medicines:', error);
      throw error;
    }
  },

  // Obtenir les détails d'un médicament de pharmacie
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/pharmacy/pharmacy-medicines/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacy medicine:', error);
      throw error;
    }
  },

  // Vérifier la disponibilité du stock
  checkStock: async (pharmacyMedicineId, requestedQuantity) => {
    try {
      const medicine = await this.getById(pharmacyMedicineId);
      const available = medicine.quantity || 0;
      
      return {
        available: available,
        requested: requestedQuantity,
        sufficient: available >= requestedQuantity,
        shortage: Math.max(0, requestedQuantity - available),
        medicine: medicine
      };
    } catch (error) {
      console.error('Error checking stock:', error);
      throw error;
    }
  },

  // Réserver du stock pour une vente (optionnel - pour éviter les surventes)
  reserveStock: async (pharmacyMedicineId, quantity, reference = '') => {
    try {
      const reservationData = {
        pharmacy_medicine: pharmacyMedicineId,
        quantity: quantity,
        reference: reference,
        type: 'reservation'
      };
      const response = await apiClient.post('/inventory/reservations/', reservationData);
      return response.data;
    } catch (error) {
      console.error('Error reserving stock:', error);
      throw error;
    }
  },

  // Libérer une réservation de stock
  releaseReservation: async (reservationId) => {
    try {
      await apiClient.delete(`/inventory/reservations/${reservationId}/`);
      return { success: true };
    } catch (error) {
      console.error('Error releasing reservation:', error);
      throw error;
    }
  },

  // Mettre à jour le stock après une vente
  updateStock: async (pharmacyMedicineId, quantity, operation = 'reduce') => {
    try {
      const updateData = {
        quantity: quantity,
        operation: operation, // 'reduce' ou 'add'
        reason: 'SALE'
      };
      const response = await apiClient.post(`/pharmacy/pharmacy-medicines/${pharmacyMedicineId}/update-stock/`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  // Obtenir les médicaments avec stock faible
  getLowStock: async (threshold = null) => {
    try {
      const params = threshold ? { low_stock_threshold: threshold } : {};
      const response = await apiClient.get('/pharmacy/pharmacy-medicines/low-stock/', { params });
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching low stock medicines:', error);
      throw error;
    }
  },

  // Obtenir l'historique des mouvements de stock
  getStockHistory: async (pharmacyMedicineId) => {
    try {
      const response = await apiClient.get(`/inventory/logs/?pharmacy_medicine=${pharmacyMedicineId}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw error;
    }
  },

  // Valider la disponibilité pour une liste d'articles
  validateAvailability: async (items) => {
    try {
      const validationPromises = items.map(async (item) => {
        const stockCheck = await this.checkStock(item.pharmacy_medicine_id, item.quantity);
        return {
          ...item,
          stockCheck: stockCheck
        };
      });
      
      const validatedItems = await Promise.all(validationPromises);
      const hasStockIssues = validatedItems.some(item => !item.stockCheck.sufficient);
      
      return {
        items: validatedItems,
        valid: !hasStockIssues,
        issues: validatedItems.filter(item => !item.stockCheck.sufficient)
      };
    } catch (error) {
      console.error('Error validating availability:', error);
      throw error;
    }
  }
};

export default pharmacyMedicineService;
