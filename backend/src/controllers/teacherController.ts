import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const addFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { department, ...rest } = req.body;

    // Find or create department
    const dept = await prisma.department.upsert({
      where: { name: department || "General" },
      update: {},
      create: { name: department || "General" }
    });

    const Faculty = await prisma.faculty.create({
      data: {
        ...rest,
        departmentId: dept.id
      },
      include: { students: true, department: true }
    });
    res.status(201).json(Faculty);
  } catch (error: any) {
    console.error("Error adding Faculty:", error);
    res.status(400).json({ message: "Error adding Faculty: " + error.message });
  }
};

export const getFacultys = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.userRole;
    const userId = req.userId;

    let where: any = {};
    
    if (role === 'STUDENT') {
      // Find the student record matching this user
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const student = await prisma.student.findUnique({ 
        where: { email: user?.email || "" },
        select: { faculty: { select: { id: true } } }
      });
      const assignedFacultyIds = student?.faculty.map((f: any) => f.id) || [];
      where.id = { in: assignedFacultyIds };
    }

    let query: any = { where };

    if (role === 'STUDENT') {
      // Limit fields for students
      query.select = {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        photoUrl: true,
        department: { select: { name: true } }
      };
    } else {
      // Include student assignments for Faculty/HOD
      query.include = {
        students: {
          select: { id: true, name: true, batch: true, year: true }
        },
        department: { select: { name: true } }
      };
    }

    const Facultys = await prisma.faculty.findMany(query);
    res.json(Facultys);
  } catch (error: any) {
    console.error("Error fetching Facultys:", error);
    res.status(500).json({ message: "Error fetching Facultys", error: error.message });
  }
};

export const getFacultyById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const Faculty = await prisma.faculty.findUnique({
      where: { id: parseInt(id) },
      include: {
        students: {
          select: { id: true, name: true, email: true, batch: true, year: true }
        }
      }
    });
    if (!Faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.json(Faculty);
  } catch (error: any) {
    console.error("Error fetching Faculty:", error);
    res.status(500).json({ message: "Error fetching Faculty", error: error.message });
  }
};

export const updateFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { department, students, ...rest } = req.body;

    let data: any = { ...rest };

    if (department) {
      const dept = await prisma.department.upsert({
        where: { name: department },
        update: {},
        create: { name: department }
      });
      data.departmentId = dept.id;
    }

    const Faculty = await prisma.faculty.update({
      where: { id: parseInt(id) },
      data,
      include: { students: true, department: true }
    });
    res.json(Faculty);
  } catch (error: any) {
    console.error("Error updating Faculty:", error);
    res.status(400).json({ message: "Error updating Faculty: " + error.message });
  }
};

export const deleteFaculty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.faculty.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Faculty deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting Faculty:", error);
    res.status(500).json({ message: "Error deleting Faculty", error: error.message });
  }
};

export const assignStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ message: "studentIds must be an array" });
    }

    const Faculty = await prisma.faculty.update({
      where: { id: parseInt(id) },
      data: {
        students: {
          set: studentIds.map((sid: number) => ({ id: sid }))
        }
      },
      include: {
        students: {
          select: { id: true, name: true, batch: true, year: true }
        }
      }
    });
    res.json(Faculty);
  } catch (error: any) {
    console.error("Error assigning students:", error);
    res.status(400).json({ message: "Error assigning students", error: error.message });
  }
};
