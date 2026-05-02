import api from './axiosConfig';

export const loginAPI = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerAPI = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logoutAPI = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const refreshAPI = async () => {
  const response = await api.post('/auth/refresh');
  return response.data;
};

export const getCurrentUserAPI = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfileAPI = async (profileData: any) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

export const getDepartmentsAPI = async () => {
  const response = await api.get('/auth/departments');
  return response.data;
};
