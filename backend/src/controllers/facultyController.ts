import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
import fs from "fs";
import path from "path";

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

// Timetable CRUD
export const getTimetable = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const timetable = await prisma.timetable.findMany({
      where: { facultyId: faculty.id },
      include: {
        course: true
      }
    });

    res.json(timetable);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching timetable", error: error.message });
  }
};

export const createTimetableSlot = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const { courseId, subject, section, room, startTime, endTime, dayOfWeek, type } = req.body;

    const slot = await prisma.timetable.create({
      data: {
        facultyId: faculty.id,
        courseId: courseId ? Number(courseId) : null,
        subject: subject || "",
        section: section || "",
        room: room || "",
        startTime: startTime || "",
        endTime: endTime || "",
        dayOfWeek: dayOfWeek || "",
        type: type || "Lecture"
      },
      include: {
        course: true
      }
    });

    res.status(201).json(slot);
  } catch (error: any) {
    res.status(400).json({ message: "Error creating timetable slot", error: error.message });
  }
};

export const updateTimetableSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const existingSlot = await prisma.timetable.findFirst({
      where: { id: Number(id), facultyId: faculty.id }
    });

    if (!existingSlot) {
      return res.status(404).json({ message: "Timetable slot not found or access denied" });
    }

    const { courseId, subject, section, room, startTime, endTime, dayOfWeek, type } = req.body;

    const updatedSlot = await prisma.timetable.update({
      where: { id: Number(id) },
      data: {
        courseId: courseId ? Number(courseId) : null,
        subject: subject ?? existingSlot.subject,
        section: section ?? existingSlot.section,
        room: room ?? existingSlot.room,
        startTime: startTime ?? existingSlot.startTime,
        endTime: endTime ?? existingSlot.endTime,
        dayOfWeek: dayOfWeek ?? existingSlot.dayOfWeek,
        type: type ?? existingSlot.type
      },
      include: {
        course: true
      }
    });

    res.json(updatedSlot);
  } catch (error: any) {
    res.status(400).json({ message: "Error updating timetable slot", error: error.message });
  }
};

export const deleteTimetableSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const existingSlot = await prisma.timetable.findFirst({
      where: { id: Number(id), facultyId: faculty.id }
    });

    if (!existingSlot) {
      return res.status(404).json({ message: "Timetable slot not found or access denied" });
    }

    await prisma.timetable.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Timetable slot deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting timetable slot", error: error.message });
  }
};

// Course Materials CRUD
export const uploadMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const { title, description, fileName, fileData, courseId, category } = req.body;
    if (!fileName || !fileData || !courseId) {
      return res.status(400).json({ message: "Missing required fields (fileName, fileData, courseId)" });
    }

    // Save base64 data to local file
    const fileExtension = path.extname(fileName);
    const baseName = path.basename(fileName, fileExtension).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFileName = `${baseName}-${Date.now()}${fileExtension}`;
    const uploadsDir = path.join(__dirname, "../../uploads");
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, uniqueFileName);
    let fileBuffer: Buffer;
    
    if (fileData.includes(";base64,")) {
      const parts = fileData.split(";base64,");
      fileBuffer = Buffer.from(parts[1], "base64");
    } else {
      fileBuffer = Buffer.from(fileData, "base64");
    }
    
    fs.writeFileSync(filePath, fileBuffer);
    const fileUrl = `/uploads/${uniqueFileName}`;

    const material = await prisma.courseMaterial.create({
      data: {
        title: title || fileName,
        description: description || "",
        fileUrl,
        fileName: fileName,
        category: category || "Notes Synopsis/E-material",
        courseId: Number(courseId),
        facultyId: faculty.id
      },
      include: {
        course: true
      }
    });

    res.status(201).json(material);
  } catch (error: any) {
    console.error("Error in uploadMaterial:", error);
    res.status(500).json({ message: "Error uploading course material", error: error.message });
  }
};

export const getUploadedMaterials = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const materials = await prisma.courseMaterial.findMany({
      where: { facultyId: faculty.id },
      include: {
        course: true
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(materials);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching course materials", error: error.message });
  }
};

export const deleteMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found" });
    }

    const material = await prisma.courseMaterial.findFirst({
      where: { id: Number(id), facultyId: faculty.id }
    });

    if (!material) {
      return res.status(404).json({ message: "Material not found or access denied" });
    }

    // Try deleting from filesystem
    const relativePath = material.fileUrl; // e.g. /uploads/filename-123.pdf
    const absolutePath = path.join(__dirname, "../..", relativePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err: any) {
        console.error("Failed to delete file from disk:", err.message);
      }
    }

    await prisma.courseMaterial.delete({
      where: { id: Number(id) }
    });

    res.json({ message: "Material deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting material", error: error.message });
  }
};
