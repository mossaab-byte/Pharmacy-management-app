import { apiClient } from './apiClient';

 const dashboardService = {
  getKpis: () => apiClient.get('/dashboard/kpis/').then(res => res.data),
  getTopProducts: () => apiClient.get('/dashboard/top-products/').then(res => res.data),
  getRevenueTrend: () => apiClient.get('/dashboard/revenue-trend/').then(res => res.data),
  getSales: () => apiClient.get('/dashboard/sales/').then(res => res.data),
  getInventory: () => apiClient.get('/dashboard/inventory/').then(res => res.data),
};export default dashboardService;