import { apiClient } from './apiClient';

 const supplierService = {
  getAll: () => apiClient.get('/suppliers/').then(res => res.data),
  getById: (id) => apiClient.get(`/suppliers/${id}/`).then(res => res.data),
  create: (payload) => apiClient.post('/suppliers/', payload).then(res => res.data),
  update: (id, payload) => apiClient.put(`/suppliers/${id}/`, payload).then(res => res.data),
  remove: (id) => apiClient.delete(`/suppliers/${id}/`).then(res => res.data),
  // extra endpoints
  getSupplierTransactions: (id) => apiClient.get(`/suppliers/${id}/transactions/`).then(res => res.data),
  getPurchaseHistory: (id) => apiClient.get(`/suppliers/${id}/purchases/`).then(res => res.data),
  getSupplierProducts: (id) => apiClient.get(`/suppliers/${id}/products/`).then(res => res.data),
  recordPayment: (id, payload) => apiClient.post(`/suppliers/${id}/payments/`, payload).then(res => res.data),
};
export default supplierService;