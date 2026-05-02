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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const payload = {
      ...data,
      userId: user.id,
      role: user.role
    };
    const response = await api.post<Leave>('/leaves', payload);
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit leave request.');
  }
};

export const updateLeaveStatus = async (id: number, status: string, reviewedBy: string): Promise<Leave> => {
  try {
    const response = await api.patch<Leave>(`/leaves/${id}`, { status, reviewedBy });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to ${status.toLowerCase()} leave request.`);
  }
};
