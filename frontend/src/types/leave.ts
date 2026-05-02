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

export interface LeaveStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
