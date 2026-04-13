import api from './api';

export interface Faculty {
  id: number;
  name: string;
  email?: string;
  department: string;
  subject: string;
  phone: string;
  address: string;
  photoUrl: string;
  students?: { id: number; name: string; branch: string; section: string }[];
}

export type FacultyInput = Omit<Faculty, 'id' | 'students'>;

export const getFaculty = async (): Promise<Faculty[]> => {
  try {
    const response = await api.get<Faculty[]>('/teachers');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch faculty members.');
  }
};

export const getFacultyById = async (id: number): Promise<Faculty> => {
  try {
    const response = await api.get<Faculty>(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch faculty member with ID: ${id}`);
  }
};

export const createFaculty = async (data: FacultyInput): Promise<Faculty> => {
  try {
    const response = await api.post<Faculty>('/teachers', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create faculty member.');
  }
};

export const updateFaculty = async (id: number, data: Partial<FacultyInput>): Promise<Faculty> => {
  try {
    const response = await api.put<Faculty>(`/teachers/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update faculty member with ID: ${id}`);
  }
};

export const deleteFaculty = async (id: number): Promise<void> => {
  try {
    await api.delete(`/teachers/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete faculty member with ID: ${id}`);
  }
};

export const assignStudentsToFaculty = async (facultyId: number, studentIds: number[]): Promise<Faculty> => {
  try {
    const response = await api.post<Faculty>(`/teachers/${facultyId}/assign-students`, { studentIds });
    return response.data;
  } catch (error) {
    throw new Error('Failed to assign students to faculty member.');
  }
};
