export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  departmentId: number;
  department?: { name: string } | string; // Can be populated or just an ID
  batch: string;      // e.g. "2022-2026"
  year: number;       // 1, 2, 3, 4
  semester: number;
  attendanceRate: number;
  feeStatus: string;
  feeDue: number;
  feePermitted?: boolean;
  feePermissionReason?: string | null;
  faculty?: any[];
  courses?: any[];
  academicReports?: any[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
