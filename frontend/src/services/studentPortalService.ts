import api from './api';

export const getStudentDashboardData = async () => {
  const response = await api.get('/student-portal/dashboard');
  return response.data;
};

export const updateStudentProfile = async (data: any) => {
  const response = await api.patch('/student-portal/profile', data);
  return response.data;
};

export const getMonthlyProgress = async () => {
  const response = await api.get('/student-portal/progress');
  return response.data;
};

export const payFee = async (paymentMethod: 'Card' | 'UPI') => {
  const response = await api.post('/student-portal/pay-fee', { paymentMethod });
  return response.data;
};

export const getCourseMaterials = async (params?: { 
  semester?: string | number; 
  departmentId?: string | number; 
  search?: string; 
  searchMode?: 'subject' | 'faculty'; 
}) => {
  const response = await api.get('/student-portal/content', { params });
  return response.data;
};

