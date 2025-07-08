import { apiClient } from './apiClient';

const pharmacyService = {
 registerPharmacy: (data) => apiClient.post('/pharmacies/register/', data).then(res => res.data),

  getPharmacyInfo: () => apiClient.get('/pharmacy').then(res => res.data),

  updatePharmacyInfo: (data) => apiClient.put('/pharmacy', data).then(res => res.data),

  getPharmacyMedicines: (params = {}) => apiClient.get('/pharmacy/medicines', { params }).then(res => res.data),
  getPharmacySales: (params = {}) =>
  apiClient.get('/pharmacy/sales', { params }).then(res => res.data),
  addMedicineToPharmacy: (data) => apiClient.post('/pharmacy/medicines', data).then(res => res.data),

  updatePharmacyMedicine: (id, data) => apiClient.put(`/pharmacy/medicines/${id}`, data).then(res => res.data),
};

export default pharmacyService;
