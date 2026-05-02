import api from '../api/axiosConfig';

export interface Faculty {
  id: number;
  name: string;
  email?: string;
  department?: string | { name: string };
  phone?: string;
  address?: string;
  photoUrl?: string;
  students?: any[];
}

export interface FacultyInput {
  name: string;
  email: string;
  department: string;
  phone: string;
  address: string;
  photoUrl: string;
  departmentId?: number;
}

// ── Faculty Dashboard endpoints (logged-in faculty only) ──────────────────────

export const getFacultySummary = async () => {
  const response = await api.get('/faculty/summary');
  return response.data;
};

export const getAssignedStudents = async () => {
  const response = await api.get('/faculty/students');
  return response.data;
};

export const markAttendance = async (attendanceData: { studentIds: number[], subject: string, status: string }) => {
  const response = await api.post('/faculty/attendance', attendanceData);
  return response.data;
};

// ── HOD admin CRUD for faculty members ───────────────────────────────────────

export const getFaculty = async () => {
  const response = await api.get('/teachers');
  return response.data;
};

export const createFaculty = async (data: FacultyInput) => {
  const response = await api.post('/teachers', data);
  return response.data;
};

export const updateFaculty = async (id: number, data: Partial<FacultyInput>) => {
  const response = await api.put(`/teachers/${id}`, data);
  return response.data;
};

export const deleteFaculty = async (id: number) => {
  const response = await api.delete(`/teachers/${id}`);
  return response.data;
};

export const assignStudentsToFaculty = async (id: number, studentIds: number[]) => {
  const response = await api.post(`/teachers/${id}/assign-students`, { studentIds });
  return response.data;
};
