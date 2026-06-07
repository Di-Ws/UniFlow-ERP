import api from './axiosConfig';

export const getMeetingsAPI = async () => {
  const { data } = await api.get('/meetings');
  return data;
};

export const createMeetingAPI = async (meetingData: {
  topic: string;
  departmentId: number;
  semester: number;
  meetingLink: string;
  courseId?: number;
  capacity?: number;
}) => {
  const { data } = await api.post('/meetings', meetingData);
  return data;
};

export const joinMeetingAPI = async (id: number) => {
  const { data } = await api.post(`/meetings/${id}/join`);
  return data;
};

export const leaveMeetingAPI = async (id: number) => {
  const { data } = await api.post(`/meetings/${id}/leave`);
  return data;
};

export const deleteMeetingAPI = async (id: number) => {
  const { data } = await api.delete(`/meetings/${id}`);
  return data;
};
