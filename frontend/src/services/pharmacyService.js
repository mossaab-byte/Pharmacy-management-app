import { apiClient } from './apiClient';

const pharmacyService = {
  registerPharmacy: (data) => apiClient.post('/pharmacies/register/', data).then(res => res.data),

  getPharmacyInfo: () => apiClient.get('/pharmacy/').then(res => res.data),

  updatePharmacyInfo: (data) => apiClient.put('/pharmacy/', data).then(res => res.data),

  // Get current pharmacy details
  getCurrentPharmacy: async () => {
    try {
      const response = await apiClient.get('/pharmacy/');
      return response.data;
    } catch (error) {
      console.error('Error fetching current pharmacy:', error);
      // Return default pharmacy data if API fails
      return {
        name: 'PHARMACIE MODERNE',
        address: 'Adresse de la pharmacie',
        phone: 'Téléphone',
        license_number: 'N° Licence'
      };
    }
  },

  getPharmacyMedicines: (params = {}) => apiClient.get('/pharmacy/pharmacy-medicines/', { params }).then(res => res.data),
  
  getPharmacySales: (params = {}) => apiClient.get('/sales/sales/', { params }).then(res => res.data),
  
  addMedicineToPharmacy: (data) => apiClient.post('/pharmacy/pharmacy-medicines/', data).then(res => res.data),

  updatePharmacyMedicine: (id, data) => apiClient.put(`/pharmacy/pharmacy-medicines/${id}/`, data).then(res => res.data),
};

export default pharmacyService;
