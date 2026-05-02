import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Get all data for the Student Portal dashboard
 */
export const getStudentPortalData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    // Include courses and map faculty for "TBA" logic
    const studentWithCourses = await prisma.student.findUnique({
      where: { userId },
      include: {
        assignments: { orderBy: { dueDate: 'asc' } },
        transactions: { orderBy: { date: 'desc' } },
        academicReports: true,
        attendanceRecords: true,
        courses: {
          include: { faculty: true }
        }
      }
    });

    if (!studentWithCourses) return res.status(404).json({ message: "Student profile not found" });

    const sanitizedCourses = studentWithCourses.courses.map(course => ({
      ...course,
      faculty: course.faculty.length > 0 
        ? course.faculty.map(f => ({ name: f.name, email: f.email })) 
        : [{ name: "TBA", email: "N/A" }]
    }));

    res.json({
      ...studentWithCourses,
      courses: sanitizedCourses
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching portal data", error: error.message });
  }
};

/**
 * Update student profile (phone, photo, guardian, next of kin)
 */
export const updateStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { 
      phone, photoUrl, address,
      guardianName, guardianPhone, guardianAddress,
      nextOfKinName, nextOfKinPhone 
    } = req.body;

    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: {
        phone, photoUrl, address,
        guardianName, guardianPhone, guardianAddress,
        nextOfKinName, nextOfKinPhone
      }
    });

    res.json({ message: "Profile updated successfully", student: updatedStudent });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

/**
 * Get monthly progress for Recharts
 */
export const getMonthlyProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const student = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch attendance for the month
    const attendance = await prisma.attendance.groupBy({
      by: ['status'],
      where: { 
        studentId: student.id,
        date: { gte: startOfMonth }
      },
      _count: true
    });

    // Fetch academic reports for the month
    const reports = await prisma.academicReport.findMany({
      where: { 
        studentId: student.id,
        // Since we don't have a date on AcademicReport, we'll assume current month's latest ones
        // In a real app, you'd have a createdAt field
      }
    });

    const present = attendance.find(a => a.status === 'PRESENT')?._count || 0;
    const absent = attendance.find(a => a.status === 'ABSENT')?._count || 0;
    const total = present + absent;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    const avgMarks = reports.length > 0 
      ? reports.reduce((acc, r) => acc + r.marks, 0) / reports.length 
      : 0;

    res.json({
      month: now.toLocaleString('default', { month: 'short' }),
      attendanceRate: Math.round(attendanceRate),
      averageMarks: Math.round(avgMarks)
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching progress", error: error.message });
  }
};

/**
 * Get syllabus (courses) for the current student's semester and department
 */
export const getSyllabus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    console.log(`[SyllabusAPI] Fetching for userId: ${userId}`);
    
    const student = await prisma.student.findUnique({ 
      where: { userId },
      select: { departmentId: true, semester: true }
    });

    if (!student) {
      console.warn(`[SyllabusAPI] No student profile found for userId: ${userId}`);
      return res.status(404).json({ message: "Student profile not found" });
    }

    console.log(`[SyllabusAPI] Student ${userId} is in Dept ${student.departmentId}, Sem ${student.semester}`);

    const syllabus = await prisma.course.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester
      },
      include: {
        faculty: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`[SyllabusAPI] Found ${syllabus.length} courses for student ${userId}`);
    res.json(syllabus);
  } catch (error: any) {
    console.error("[SyllabusAPI] Error:", error);
    res.status(500).json({ message: "Error fetching syllabus", error: error.message });
  }
};
