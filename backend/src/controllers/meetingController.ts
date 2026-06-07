import { Response } from "express";
import { prisma } from "../config/db";
import { GatekeeperRequest } from "../middleware/gatekeeperMiddleware";

/**
 * Get all meetings accessible to the active user
 */
export const getMeetings = async (req: GatekeeperRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User context missing" });
    }

    let meetings = [];

    if (user.role === "STUDENT") {
      if (!user.student) {
        return res.status(403).json({ message: "Student profile not found" });
      }
      meetings = await prisma.virtualClassroom.findMany({
        where: {
          departmentId: user.student.departmentId,
          semester: user.student.semester
        },
        include: {
          department: { select: { id: true, name: true } },
          faculty: { select: { id: true, name: true, userId: true } },
          course: { select: { id: true, name: true, code: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else if (user.role === "FACULTY") {
      if (!user.faculty) {
        return res.status(403).json({ message: "Faculty profile not found" });
      }
      meetings = await prisma.virtualClassroom.findMany({
        where: {
          facultyId: user.faculty.id
        },
        include: {
          department: { select: { id: true, name: true } },
          faculty: { select: { id: true, name: true, userId: true } },
          course: { select: { id: true, name: true, code: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else if (user.role === "HOD") {
      // HOD manages a department
      const dept = await prisma.department.findFirst({
        where: { hodId: user.id }
      });
      if (!dept) {
        return res.status(403).json({ message: "HOD department assignment not found" });
      }
      meetings = await prisma.virtualClassroom.findMany({
        where: {
          departmentId: dept.id
        },
        include: {
          department: { select: { id: true, name: true } },
          faculty: { select: { id: true, name: true, userId: true } },
          course: { select: { id: true, name: true, code: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      // Admin fallback
      meetings = await prisma.virtualClassroom.findMany({
        include: {
          department: { select: { id: true, name: true } },
          faculty: { select: { id: true, name: true, userId: true } },
          course: { select: { id: true, name: true, code: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    }

    // Dynamic Capacity Calculation (Aggregating student counts per dept + sem)
    const studentGroups = await prisma.student.groupBy({
      by: ["departmentId", "semester"],
      _count: { id: true }
    });

    const meetingsWithCap = meetings.map((m: any) => {
      const match = studentGroups.find(
        (g: any) => g.departmentId === m.departmentId && g.semester === m.semester
      );
      const studentCount = match?._count.id || 0;
      // Hard structural cap is the minimum of studentCount + 1 or the capacity (which defaults to 56)
      const seatCap = Math.min(studentCount + 1, m.capacity);
      return {
        ...m,
        seatCap
      };
    });

    res.json(meetingsWithCap);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching virtual classrooms", error: error.message });
  }
};

/**
 * Create a new virtual classroom session
 */
export const createMeeting = async (req: GatekeeperRequest, res: Response) => {
  try {
    const user = req.user;
    if (user.role !== "FACULTY" && user.role !== "HOD") {
      return res.status(403).json({ message: "Forbidden: Only instructors or HODs can schedule sessions" });
    }

    const { topic, departmentId, semester, meetingLink, courseId, capacity } = req.body;

    if (!topic || !departmentId || !semester || !meetingLink) {
      return res.status(400).json({ message: "Please provide topic, department, semester, and meeting link" });
    }

    let facultyId: number;

    if (user.role === "FACULTY") {
      if (!user.faculty) {
        return res.status(403).json({ message: "Faculty profile not found" });
      }
      facultyId = user.faculty.id;
    } else {
      // For HOD, they must either have a faculty profile or we use a fallback or assign to them.
      // Let's find their faculty profile if it exists, or create one, or check if they have a faculty ID.
      const facultyProfile = await prisma.faculty.findFirst({
        where: { userId: user.id }
      });
      if (!facultyProfile) {
        return res.status(403).json({ message: "HOD must have an associated Faculty profile to host classes" });
      }
      facultyId = facultyProfile.id;
    }

    const session = await prisma.virtualClassroom.create({
      data: {
        topic,
        meetingLink,
        departmentId: parseInt(departmentId),
        semester: parseInt(semester),
        courseId: courseId ? parseInt(courseId) : null,
        facultyId,
        capacity: capacity ? parseInt(capacity) : 56,
        activeParticipants: 0
      },
      include: {
        department: { select: { id: true, name: true } },
        faculty: { select: { id: true, name: true, userId: true } }
      }
    });

    res.status(201).json({ message: "Session created successfully", session });
  } catch (error: any) {
    res.status(500).json({ message: "Error scheduling virtual classroom", error: error.message });
  }
};

/**
 * Join meeting and increment active participant count
 */
export const joinMeeting = async (req: GatekeeperRequest, res: Response) => {
  try {
    const meeting = req.meeting; // Set in verifyGatekeeper
    
    // Increment seat counter
    const updated = await prisma.virtualClassroom.update({
      where: { id: meeting.id },
      data: { activeParticipants: { increment: 1 } }
    });

    // Return raw meeting link securely (obfuscated from general query APIs)
    res.json({
      message: "Authorized",
      meetingLink: meeting.meetingLink,
      activeParticipants: updated.activeParticipants
    });
  } catch (error: any) {
    console.error("JOIN MEETING ERROR:", error);
    res.status(500).json({ message: "Error joining virtual classroom", error: error.message });
  }
};

/**
 * Leave meeting and decrement active participant count
 */
export const leaveMeeting = async (req: GatekeeperRequest, res: Response) => {
  try {
    const meetingId = parseInt(req.params.id);
    if (isNaN(meetingId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const meeting = await prisma.virtualClassroom.findUnique({
      where: { id: meetingId }
    });

    if (!meeting) {
      return res.status(404).json({ message: "Session not found" });
    }

    let updatedParticipants = meeting.activeParticipants;

    if (meeting.activeParticipants > 0) {
      const updated = await prisma.virtualClassroom.update({
        where: { id: meetingId },
        data: { activeParticipants: { decrement: 1 } }
      });
      updatedParticipants = updated.activeParticipants;
    }

    res.json({
      message: "Seat released successfully",
      activeParticipants: updatedParticipants
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error leaving session", error: error.message });
  }
};

/**
 * Delete / End a virtual classroom session
 */
export const deleteMeeting = async (req: GatekeeperRequest, res: Response) => {
  try {
    const meetingId = parseInt(req.params.id);
    if (isNaN(meetingId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const user = req.user;
    const meeting = await prisma.virtualClassroom.findUnique({
      where: { id: meetingId },
      include: { department: true }
    });

    if (!meeting) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check permissions: creator faculty or HOD of department
    let hasPermission = false;
    if (user.role === "HOD") {
      const managedDept = await prisma.department.findFirst({
        where: { hodId: user.id }
      });
      if (managedDept && managedDept.id === meeting.departmentId) {
        hasPermission = true;
      }
    } else if (user.role === "FACULTY" && user.faculty) {
      if (meeting.facultyId === user.faculty.id) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: You do not have permission to end this session" });
    }

    await prisma.virtualClassroom.delete({
      where: { id: meetingId }
    });

    res.json({ message: "Virtual classroom session ended successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error ending session", error: error.message });
  }
};

/**
 * Get courses with optional departmentId and semester filters (scoped to user's department by default)
 */
export const getCourses = async (req: GatekeeperRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User context missing" });
    }

    const { departmentId, semester } = req.query;

    const whereClause: any = {};

    if (departmentId) {
      const parsedDeptId = parseInt(departmentId as string);
      if (!isNaN(parsedDeptId)) {
        whereClause.departmentId = parsedDeptId;
      }
    }
    if (semester) {
      const parsedSem = parseInt(semester as string);
      if (!isNaN(parsedSem)) {
        whereClause.semester = parsedSem;
      }
    }

    // Default to the user's department if no department filter is specified
    if (!whereClause.departmentId) {
      if (user.role === "HOD") {
        const dept = await prisma.department.findFirst({
          where: { hodId: user.id }
        });
        if (dept) {
          whereClause.departmentId = dept.id;
        }
      } else if (user.role === "FACULTY") {
        if (user.faculty) {
          whereClause.departmentId = user.faculty.departmentId;
        } else {
          const facultyProfile = await prisma.faculty.findFirst({
            where: { userId: user.id }
          });
          if (facultyProfile) {
            whereClause.departmentId = facultyProfile.departmentId;
          }
        }
      } else if (user.role === "STUDENT") {
        if (user.student) {
          whereClause.departmentId = user.student.departmentId;
        }
      }
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        name: true,
        semester: true,
        departmentId: true
      },
      orderBy: { code: "asc" }
    });

    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
};

