import { apiClient } from './apiClient';

const customerService = {
  getAll: () => apiClient.get('/api/customers/'),
  getById: (id) => apiClient.get(`/api/customers/${id}/`),
  create: (data) => apiClient.post('/api/customers/', data),
  update: (id, data) => apiClient.put(`/api/customers/${id}/`, data),
  remove: (id) => apiClient.delete(`/api/customers/${id}/`),
  
  // Add these new methods
  getSales: (customerId) => {
    return apiClient.get(`/api/customers/${customerId}/sales/`)
      .then(response => response.data);
  },
  
  getPayments: (customerId) => {
    return apiClient.get(`/api/customers/${customerId}/payments/`)
      .then(response => response.data);
  }
};

export default customerService;