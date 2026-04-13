export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  department?: string; // Optional if not all existing records have it
  section: string;
  branch: string;      // Matching Prisma schema currently
  semester: number;    // Matching Prisma schema currently
  attendance: number;
  feeStatus: string;   // Matching Prisma schema currently
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}
