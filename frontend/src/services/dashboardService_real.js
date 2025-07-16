import { apiClient } from './apiClient';

const dashboardService = {
  // Récupérer les KPIs principales
  getKpis: async () => {
    try {
      const response = await apiClient.get('/dashboard/kpis/');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des KPIs:', error);
      throw error;
    }
  },

  // Récupérer les produits les plus vendus
  getTopProducts: async (limit = 5) => {
    try {
      const response = await apiClient.get(`/dashboard/top-products/?limit=${limit}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des produits populaires:', error);
      throw error;
    }
  },

  // Récupérer les tendances de revenus
  getRevenueTrend: async (days = 30) => {
    try {
      const response = await apiClient.get(`/dashboard/revenue-trend/?days=${days}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tendances:', error);
      throw error;
    }
  },

  // Récupérer les ventes récentes
  getRecentSales: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/sales/?limit=${limit}&ordering=-created_at`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des ventes récentes:', error);
      throw error;
    }
  },

  // Récupérer l'état des stocks
  getInventoryStatus: async () => {
    try {
      const response = await apiClient.get('/dashboard/inventory-status/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'état des stocks:', error);
      throw error;
    }
  },

  // Récupérer les médicaments avec stock faible
  getLowStockMedicines: async (threshold = 10) => {
    try {
      const response = await apiClient.get(`/pharmacy/pharmacy-medicines/low-stock/?threshold=${threshold}`);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des stocks faibles:', error);
      return [];
    }
  },

  // Récupérer toutes les données du dashboard
  getAllDashboardData: async () => {
    try {
      const [kpis, topProducts, revenueTrend, recentSales, inventoryStatus, lowStockMedicines] = await Promise.all([
        dashboardService.getKpis(),
        dashboardService.getTopProducts(),
        dashboardService.getRevenueTrend(),
        dashboardService.getRecentSales(),
        dashboardService.getInventoryStatus(),
        dashboardService.getLowStockMedicines()
      ]);

      return {
        kpis,
        topProducts,
        revenueTrend,
        recentSales,
        inventoryStatus,
        lowStockMedicines
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données du dashboard:', error);
      throw error;
    }
  }
};

export default dashboardService;
