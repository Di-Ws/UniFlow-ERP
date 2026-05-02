import api from './api';

export interface AttendanceRecord {
  studentId: number;
  courseId?: number | null;
  date: string;
  period: string;
  status: 'PRESENT' | 'ABSENT';
}

export const markBulkAttendanceAPI = async (records: AttendanceRecord[]) => {
  const response = await api.post('/attendance/bulk', { records });
  return response.data;
};
