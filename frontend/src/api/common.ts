import api from './axiosConfig';

export const getTeachersAPI = async () => {
  const response = await api.get('/teachers');
  return response.data;
};

export const createTeacherAPI = async (data: any) => {
  const response = await api.post('/teachers', data);
  return response.data;
};

export const getEventsAPI = async () => {
  const response = await api.get('/events');
  return response.data;
};

export const createEventAPI = async (data: any) => {
  const response = await api.post('/events', data);
  return response.data;
};

export const addReportAPI = async (data: any) => {
  const response = await api.post('/reports', data);
  return response.data;
};

export const getStudentReportAPI = async (studentId: number) => {
  const response = await api.get(`/reports/${studentId}`);
  return response.data;
};
