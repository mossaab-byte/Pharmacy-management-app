import { apiClient } from './apiClient';

const MedicineService = {
  getMedicines: (params = {}) => {
    return apiClient.get('/medicine/medicines/', { params });
  },
  
  searchMedicines: (query) => {
    return apiClient.get('/medicine/medicines/search/', { params: { q: query } });
  },
  
  // NEW: Quick search for autocomplete and barcode scanning
  quickSearch: (query, limit = 10) => {
    return apiClient.get('/medicine/medicines/quick_search/', { 
      params: { q: query, limit } 
    });
  },
  
  // NEW: Search by exact code for barcode scanning
  searchByCode: (code) => {
    return apiClient.get('/medicine/medicines/search_by_code/', { 
      params: { code } 
    });
  },
  
  // NEW: Get all available medicines for forms
  getAllAvailable: () => {
    return apiClient.get('/medicine/medicines/', { params: { page_size: 1000 } });
  },
  
  // NEW: Get medicine statistics
  getStatistics: () => {
    return apiClient.get('/medicine/medicines/statistics/');
  },
  
  getMedicineDetails: (id) => {
    return apiClient.get(`/medicine/medicines/${id}/`);
  }
};

export default MedicineService;