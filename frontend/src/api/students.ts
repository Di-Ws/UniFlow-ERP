import api from './axiosConfig';

export const getStudentsAPI = async (search?: string) => {
  const response = await api.get('/students', { params: { search } });
  return response.data;
};

export const getStudentByIdAPI = async (id: number) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const createStudentAPI = async (data: any) => {
  const response = await api.post('/students', data);
  return response.data;
};

export const updateStudentAPI = async (id: number, data: any) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const deleteStudentAPI = async (id: number) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const getDashboardStatsAPI = async () => {
  const response = await api.get('/students/stats');
  return response.data;
};
