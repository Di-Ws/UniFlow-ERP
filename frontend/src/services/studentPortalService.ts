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
