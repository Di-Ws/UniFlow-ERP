import api from './api';

/**
 * Fetches HOD leave comparison data for Recharts Bar Chart
 */
export const getHODLeaveAnalytics = async () => {
  const response = await api.get('/analytics/hod/leaves');
  return response.data;
};

/**
 * Fetches Student attendance summary for Recharts Pie Chart
 */
export const getStudentAttendanceAnalytics = async () => {
  const response = await api.get('/analytics/student/attendance');
  return response.data;
};
