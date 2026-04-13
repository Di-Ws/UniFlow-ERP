import api from './api';

export interface Leave {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  reviewedBy?: string;
  createdAt: string;
}

export interface LeaveInput {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export const getLeaves = async (): Promise<Leave[]> => {
  try {
    const response = await api.get<Leave[]>('/leaves');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch leave requests.');
  }
};

export const getUserLeaves = async (): Promise<Leave[]> => {
  try {
    const response = await api.get<Leave[]>('/leaves/user');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch your leave requests.');
  }
};

export const createLeave = async (data: LeaveInput): Promise<Leave> => {
  try {
    const response = await api.post<Leave>('/leaves', data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit leave request.');
  }
};

export const updateLeaveStatus = async (id: number, status: string): Promise<Leave> => {
  try {
    const response = await api.put<Leave>(`/leaves/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to ${status.toLowerCase()} leave request.`);
  }
};
