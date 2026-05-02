import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getPendingUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching pending users", error: error.message });
  }
};

export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use APPROVED or REJECTED." });
    }

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { status },
      include: { student: true, faculty: true }
    });

    // Automatically create profile if approved and doesn't exist
    if (status === 'APPROVED') {
      const defaultDept = await prisma.department.findFirst() || 
                         await prisma.department.create({ data: { name: 'General' } });

      const metadata: any = user.registrationMetadata || {};
      const targetDeptId = metadata.departmentId ? Number(metadata.departmentId) : defaultDept.id;

      if (user.role === 'STUDENT' && !user.student) {
        await prisma.student.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: 'Pending',
            address: 'Pending',
            batch: '2024-2028',
            year: 1,
            semester: 1,
            departmentId: targetDeptId
          }
        });
      } else if (user.role === 'FACULTY' && !user.faculty) {
        await prisma.faculty.create({
          data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            phone: 'Pending',
            address: 'Pending',
            departmentId: targetDeptId
          }
        });
      }
    }

    res.json({ message: `User ${status.toLowerCase()} successfully`, user: { id: user.id, status: user.status } });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Error updating user status", error: error.message });
  }
};

export const getPendingCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.user.count({
      where: { status: 'PENDING' }
    });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching pending count" });
  }
};

/**
 * Assign a faculty member to a course
 */
export const assignFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, facultyId } = req.body;
    
    await prisma.course.update({
      where: { id: parseInt(courseId) },
      data: {
        faculty: {
          connect: { id: parseInt(facultyId) }
        }
      }
    });

    res.json({ message: "Faculty assigned successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Assignment failed", error: error.message });
  }
};

/**
 * Get all faculty for dropdowns
 */
export const getAllFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const faculty = await prisma.faculty.findMany({
      select: { id: true, name: true, email: true }
    });
    res.json(faculty);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching faculty", error: error.message });
  }
};

/**
 * Get unassigned courses for a department
 */
export const getUnassignedCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { deptName } = req.query;
    const courses = await prisma.course.findMany({
      where: {
        department: { name: { contains: deptName as string } },
        faculty: { none: {} }
      }
    });
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
};
