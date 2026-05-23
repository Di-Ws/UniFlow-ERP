import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getPendingUsers = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.userRole;
    const userId = req.userId;

    const users = await prisma.user.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        registrationMetadata: true
      }
    });

    if (role === 'HOD') {
      const hodDept = await prisma.department.findUnique({
        where: { hodId: userId }
      });
      if (hodDept) {
        const filteredUsers = users.filter((u: any) => {
          const metadata = u.registrationMetadata as any;
          if (!metadata) return false;
          return String(metadata.departmentId) === String(hodDept.id);
        });
        return res.json(filteredUsers);
      } else {
        return res.json([]);
      }
    }

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
            departmentId: targetDeptId,
            feeStatus: 'Unpaid',
            feeDue: 5000
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
    const role = req.userRole;
    const userId = req.userId;

    if (role === 'HOD') {
      const hodDept = await prisma.department.findUnique({
        where: { hodId: userId }
      });
      if (!hodDept) {
        return res.json({ count: 0 });
      }
      const users = await prisma.user.findMany({
        where: { status: 'PENDING' },
        select: { registrationMetadata: true }
      });
      const count = users.filter((u: any) => {
        const metadata = u.registrationMetadata as any;
        return metadata && String(metadata.departmentId) === String(hodDept.id);
      }).length;
      return res.json({ count });
    }

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
    const role = req.userRole;
    const userId = req.userId;

    let where: any = {};
    if (role === 'HOD') {
      const hodDept = await prisma.department.findUnique({
        where: { hodId: userId }
      });
      if (hodDept) {
        where.departmentId = hodDept.id;
      } else {
        where.departmentId = -1; // No department, show nothing
      }
    }

    const faculty = await prisma.faculty.findMany({
      where,
      select: { id: true, name: true, email: true }
    });
    res.json(faculty);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching faculty", error: error.message });
  }
};

export const getUnassignedCourses = async (req: AuthRequest, res: Response) => {
  try {
    let { deptName } = req.query;
    if (!deptName && req.userRole === 'HOD') {
      const hodDept = await prisma.department.findUnique({
        where: { hodId: req.userId }
      });
      if (hodDept) {
        deptName = hodDept.name;
      }
    }

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

/**
 * Get all students who have not paid fees
 */
export const getUnpaidStudents = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.userRole;
    const userId = req.userId;

    // Auto-correct: If any student has feeStatus !== 'Paid' but feeDue <= 0, set feeDue to 5000
    await prisma.student.updateMany({
      where: {
        feeStatus: { not: "Paid" },
        feeDue: { lte: 0 }
      },
      data: {
        feeDue: 5000
      }
    });

    let whereClause: any = {
      feeStatus: { not: "Paid" }
    };

    if (role === 'HOD') {
      const hodDept = await prisma.department.findUnique({
        where: { hodId: userId }
      });
      if (hodDept) {
        whereClause.departmentId = hodDept.id;
      } else {
        whereClause.departmentId = -1; // No department, show nothing
      }
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        feeStatus: true,
        feeDue: true,
        feePermitted: true,
        feePermissionReason: true,
        department: {
          select: { name: true }
        },
        batch: true,
        year: true,
        semester: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(students);
  } catch (error: any) {
    console.error("Error fetching unpaid students:", error);
    res.status(500).json({ message: "Error fetching unpaid students", error: error.message });
  }
};

/**
 * HOD permits/waives attendance check for an unpaid student
 */
export const permitStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { permitted, reason } = req.body;

    if (permitted && !reason) {
      return res.status(400).json({ message: "A reason is required to permit attendance." });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        feePermitted: Boolean(permitted),
        feePermissionReason: permitted ? reason : null
      }
    });

    res.json({
      message: `Student attendance override ${permitted ? 'granted' : 'revoked'} successfully.`,
      student: updatedStudent
    });
  } catch (error: any) {
    console.error("Error updating student permit:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Student profile not found" });
    }
    res.status(500).json({ message: "Error updating student permission", error: error.message });
  }
};

