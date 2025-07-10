import { apiClient } from './apiClient';

// Medicine Service - Real Database Connection Only
const medicineService = {
  // Get all medicines from Django backend
  getAllMedicines: async () => {
    try {
      console.log('🔗 Fetching ALL medicines from Django backend...');
      const response = await apiClient.get('/medicine/medicines/', { 
        params: { 
          page_size: 10000, // Get all medicines
          ordering: 'nom'
        } 
      });
      
      const count = response.data?.results?.length || response.data?.count || 0;
      console.log(`✅ Successfully loaded ${count} medicines from Django database`);
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching all medicines:', error);
      throw error;
    }
  },

  // Get medicines with pagination
  getMedicines: async (params = {}) => {
    try {
      const queryParams = {
        page_size: params.page_size || 100,
        page: params.page || 1,
        search: params.search || '',
        ordering: params.ordering || 'nom',
        ...params
      };
      
      const response = await apiClient.get('/medicine/medicines/', { params: queryParams });
      return response;
    } catch (error) {
      console.error('❌ Error fetching medicines:', error);
      throw error;
    }
  },

  // Quick search for forms
  quickSearch: async (query, limit = 20) => {
    try {
      if (!query || query.length < 2) {
        return { data: { results: [] } };
      }

      const response = await apiClient.get('/medicine/medicines/', { 
        params: { 
          search: query,
          page_size: limit,
          ordering: 'nom'
        } 
      });
      
      return response;
    } catch (error) {
      console.error('❌ Quick search failed:', error);
      throw error;
    }
  },

  // Search by barcode
  searchByCode: async (code) => {
    try {
      const response = await apiClient.get('/medicine/medicines/search_by_code/', { 
        params: { code: code }
      });
      
      if (response.data?.found && response.data?.medicine) {
        return { data: response.data.medicine };
      } else {
        return { data: null };
      }
    } catch (error) {
      console.error('❌ Barcode search failed:', error);
      throw error;
    }
  },

  // Get medicine by ID
  getMedicineById: async (id) => {
    try {
      const response = await apiClient.get(`/medicine/medicines/${id}/`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching medicine by ID:', error);
      throw error;
    }
  },

  // Get all medicines (alias for compatibility)
  getAll: async () => {
    try {
      const response = await apiClient.get('/medicine/medicines/', { 
        params: { 
          page_size: 10000,
          ordering: 'nom'
        } 
      });
      
      return response.data?.results || [];
    } catch (error) {
      console.error('❌ getAll() failed:', error);
      throw error;
    }
  },

  // Search medicines
  searchMedicines: async (query, limit = 50) => {
    try {
      const response = await apiClient.get('/medicine/medicines/', { 
        params: { 
          search: query,
          page_size: limit,
          ordering: 'nom'
        } 
      });
      
      return response;
    } catch (error) {
      console.error('❌ Error searching medicines:', error);
      throw error;
    }
  },

  // Get medicine statistics
  getMedicineStats: async () => {
    try {
      const response = await apiClient.get('/medicine/medicines/stats/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching medicine statistics:', error);
      throw error;
    }
  }
};

export default medicineService;
