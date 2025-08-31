// Optimized Medicine Service - NO BULK LOADING
// This service provides fast, on-demand medicine search without loading all 5000+ medicines

import { apiClient } from './apiClient';

const medicineServiceOptimized = {
  // Real-time search - only loads what's needed
  quickSearch: async (query, limit = 20) => {
    try {
      if (!query || query.length < 2) {
        return { data: [] };
      }
      
      console.log(`🔍 OPTIMIZED - Quick search: "${query}"`);
      const response = await apiClient.get('/medicine/medicines/quick_search/', { 
        params: { q: query, limit } 
      });
      
      const medicines = response.data || [];
      console.log(`✅ OPTIMIZED - Found ${medicines.length} results instantly`);
      return { data: medicines };
    } catch (error) {
      console.error('❌ OPTIMIZED - Quick search error:', error);
      throw error;
    }
  },

  // Search by exact code (barcode)
  searchByCode: async (code) => {
    try {
      console.log(`🔍 OPTIMIZED - Code search: "${code}"`);
      const response = await apiClient.get('/medicine/medicines/search_by_code/', { 
        params: { code } 
      });
      
      if (response.data?.found) {
        console.log(`✅ OPTIMIZED - Medicine found by code`);
        return { data: response.data.medicine };
      } else {
        console.log(`❌ OPTIMIZED - Medicine not found by code`);
        return { data: null };
      }
    } catch (error) {
      console.error('❌ OPTIMIZED - Code search error:', error);
      throw error;
    }
  },

  // Get paginated medicines (for management pages)
  getMedicines: async (params = {}) => {
    try {
      console.log('🔍 OPTIMIZED - Getting paginated medicines');
      const response = await apiClient.get('/medicine/medicines/', { params });
      
      return {
        data: response.data?.results || response.data || [],
        pagination: {
          count: response.data?.count || 0,
          next: response.data?.next,
          previous: response.data?.previous
        }
      };
    } catch (error) {
      console.error('❌ OPTIMIZED - Get medicines error:', error);
      throw error;
    }
  },

  // Get medicine by ID
  getMedicine: async (id) => {
    try {
      const response = await apiClient.get(`/medicine/medicines/${id}/`);
      return { data: response.data };
    } catch (error) {
      console.error('❌ OPTIMIZED - Get medicine error:', error);
      throw error;
    }
  },

  // Get medicine statistics
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/medicine/medicines/statistics/');
      return { data: response.data };
    } catch (error) {
      console.error('❌ OPTIMIZED - Get statistics error:', error);
      throw error;
    }
  },

  // DEPRECATED: Do not use - this loads all medicines (5000+) causing 2-minute delays
  getAll: async () => {
    console.warn('⚠️ WARNING: getAll() is deprecated and causes performance issues!');
    console.warn('⚠️ Use quickSearch() or getMedicines() with pagination instead');
    throw new Error('getAll() is deprecated - use quickSearch() or getMedicines() instead');
  }
};

// For backwards compatibility, export as both default and named
export default medicineServiceOptimized;
export { medicineServiceOptimized };
