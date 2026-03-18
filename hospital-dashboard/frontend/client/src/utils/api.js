import axios from 'axios';

const api = axios.create({
  baseURL: `http://${window.location.hostname}:3000/api`, // Dynamic Backend URL for LAN access
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDepartments = async () => {
  const response = await api.get('/departments');
  return response.data;
};

export const getIndicators = async () => {
  const response = await api.get('/indicators');
  return response.data;
};

export const updateIndicatorTarget = async (id, targetData) => {
  const response = await api.put(`/indicators/${id}`, targetData);
  return response.data;
};

export const getIndicatorData = async (params) => {
  const response = await api.get('/indicator-data', { params });
  return response.data;
};

export const postIndicatorData = async (data) => {
  const response = await api.post('/indicator-data', data);
  return response.data;
};

export const getYears = async () => {
  const response = await api.get('/years');
  return response.data;
};

// Returns only departments that are authorized for the given indicator
export const getDepartmentsByIndicator = async (indicatorId) => {
  const response = await api.get(`/chi-so/${indicatorId}/khoa`);
  return response.data;
};

export default api;
