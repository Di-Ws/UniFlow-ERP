import api from './api';

export const getPendingUsers = async () => {
  const response = await api.get('/admin/pending-users');
  return response.data;
};

export const approveUser = async (id: number, status: 'APPROVED' | 'REJECTED') => {
  const response = await api.patch(`/admin/approve-user/${id}`, { status });
  return response.data;
};

export const getPendingCount = async () => {
  const response = await api.get('/admin/pending-count');
  return response.data;
};

export const getUnpaidStudents = async () => {
  const response = await api.get('/admin/unpaid-students');
  return response.data;
};

export const permitStudent = async (id: number, permitted: boolean, reason?: string) => {
  const response = await api.patch(`/admin/permit-student/${id}`, { permitted, reason });
  return response.data;
};
