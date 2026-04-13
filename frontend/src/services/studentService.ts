import api from './api';
import { Student } from '../types/student';

// Defines the data you send when creating/updating a student. Can be adjusted.
export type StudentInput = Omit<Student, 'id'>;

export const getStudents = async (): Promise<Student[]> => {
  try {
    const response = await api.get<Student[]>('/students');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch students. Please try again later.');
  }
};

export const getStudentById = async (id: number): Promise<Student> => {
  try {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch student with ID: ${id}`);
  }
};

export const createStudent = async (data: StudentInput): Promise<Student> => {
  try {
    const response = await api.post<Student>('/students', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create student. Please verify the provided details.');
  }
};

export const updateStudent = async (id: number, data: Partial<StudentInput>): Promise<Student> => {
  try {
    const response = await api.put<Student>(`/students/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update student with ID: ${id}`);
  }
};

export const deleteStudent = async (id: number): Promise<void> => {
  try {
    await api.delete(`/students/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete student with ID: ${id}`);
  }
};
