import { apiClient } from './apiClient';

const purchaseService = {
  getAll: () => apiClient.get('/purchases/').then(res => res.data),
  getById: (id) => apiClient.get(`/purchases/${id}/`).then(res => res.data),
  create: (payload) => apiClient.post('/purchases/', payload).then(res => res.data),
  update: (id, payload) => apiClient.put(`/purchases/${id}/`, payload).then(res => res.data),
  remove: (id) => apiClient.delete(`/purchases/${id}/`).then(res => res.data),
};
export default purchaseService;