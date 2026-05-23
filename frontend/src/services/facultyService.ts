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

// ── Faculty Timetable CRUD ───────────────────────────────────────────────
export const getMyCourses = async () => {
  const response = await api.get('/faculty/my-courses');
  return response.data;
};

export const getTimetable = async () => {
  const response = await api.get('/faculty/timetable');
  return response.data;
};

export const createTimetableSlot = async (data: any) => {
  const response = await api.post('/faculty/timetable', data);
  return response.data;
};

export const updateTimetableSlot = async (id: number, data: any) => {
  const response = await api.put(`/faculty/timetable/${id}`, data);
  return response.data;
};

export const deleteTimetableSlot = async (id: number) => {
  const response = await api.delete(`/faculty/timetable/${id}`);
  return response.data;
};

// ── Faculty Course Materials CRUD ───────────────────────────────────────
export const getUploadedMaterials = async () => {
  const response = await api.get('/faculty/content');
  return response.data;
};

export const uploadMaterial = async (data: { title: string, description: string, fileName: string, fileData: string, courseId: number, category?: string }) => {
  const response = await api.post('/faculty/content', data);
  return response.data;
};

export const deleteMaterial = async (id: number) => {
  const response = await api.delete(`/faculty/content/${id}`);
  return response.data;
};
