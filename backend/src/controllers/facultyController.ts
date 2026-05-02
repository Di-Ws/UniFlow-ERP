import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // In the new schema, User -> Faculty is via Faculty.userId
    const facultyProfile = await prisma.faculty.findUnique({
      where: { userId },
      include: {
        students: { select: { id: true, name: true, batch: true, year: true } },
        timetable: true,
        department: { select: { name: true } }
      }
    });

    if (!facultyProfile) {
      // Fallback: try matching by email
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const profileByEmail = await prisma.faculty.findUnique({
        where: { email: user.email },
        include: {
          students: { select: { id: true, name: true, batch: true, year: true } },
          timetable: true,
          department: { select: { name: true } }
        }
      });

      if (!profileByEmail) {
        return res.status(404).json({ message: "Faculty profile not found. Please ensure HOD has linked your account." });
      }

      // Auto-link the user to this faculty profile
      await prisma.faculty.update({ where: { id: profileByEmail.id }, data: { userId } });

      return buildSummaryResponse(res, profileByEmail);
    }

    return buildSummaryResponse(res, facultyProfile);
  } catch (error: any) {
    console.error("Error fetching faculty summary:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const buildSummaryResponse = async (res: Response, faculty: any) => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const totalStudents = faculty.students.length;
  const classesToday = faculty.timetable.filter((t: any) => t.dayOfWeek === today).length;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const attendanceCount = await prisma.attendance.count({
    where: {
      facultyId: faculty.id,
      date: { gte: startOfDay }
    }
  });

  res.json({
    profile: {
      id: faculty.id,
      name: faculty.name,
      department: faculty.department?.name || "N/A",
      email: faculty.email,
      phone: faculty.phone,
      photoUrl: faculty.photoUrl
    },
    analytics: {
      totalStudents,
      classesToday,
      attendanceTaken: `${attendanceCount}/${classesToday}`,
      pendingTasks: 0
    },
    timetable: faculty.timetable.filter((t: any) => t.dayOfWeek === today),
    announcements: await prisma.announcement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    studentsOnLeave: await prisma.leave.findMany({
      where: {
        userRole: "STUDENT",
        status: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      take: 5
    })
  });
};

export const getAssignedStudents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const facultyProfile = await prisma.faculty.findUnique({
      where: { userId },
      include: {
        students: true
      }
    });

    if (!facultyProfile) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    res.json(facultyProfile.students);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { studentIds, courseId, status } = req.body;
    const userId = req.userId;

    const facultyProfile = await prisma.faculty.findUnique({ where: { userId }, select: { id: true } });

    if (!facultyProfile) {
      return res.status(403).json({ message: "Only linked faculty can mark attendance" });
    }

    const attendanceRecords = (studentIds as number[]).map((sid) => ({
      studentId: sid,
      facultyId: facultyProfile.id,
      courseId: courseId || null,
      status: status || "PRESENT"
    }));

    await prisma.attendance.createMany({ data: attendanceRecords });

    res.json({ message: "Attendance marked successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error marking attendance", error: error.message });
  }
};

/**
 * Get courses assigned to the current faculty
 */
export const getMyCourses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const courses = await prisma.course.findMany({
      where: {
        faculty: {
          some: { id: faculty.id }
        }
      },
      select: {
        id: true,
        code: true,
        name: true,
        semester: true,
        _count: {
          select: { students: true }
        }
      }
    });

    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching assigned courses", error: error.message });
  }
};
