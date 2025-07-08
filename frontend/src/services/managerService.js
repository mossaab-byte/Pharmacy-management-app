import { apiClient } from './apiClient';

const getManagers = async () => {
  const response = await apiClient.get('/managers/');
  return response.data;
};

const createManager = async (data) => {
  const pharmacist = JSON.parse(localStorage.getItem('user'));
  const payload = {
    ...data,
    pharmacy_id: pharmacist.pharmacy.id
  };
  const response = await apiClient.post('/managers/', payload);
  return response.data;
};

const updateManager = async (id, data) => {
  const response = await apiClient.patch(`/managers/${id}/update/`, data);
  return response.data;
};

const deleteManager = async (id) => {
  const response = await apiClient.delete(`/managers/${id}/delete/`);
  return response.data;
};

// Group and export as default
const managerServices = {
  getManagers,
  createManager,
  updateManager,
  deleteManager
};

export default managerServices;
