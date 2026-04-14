import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const addTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.create({
      data: req.body,
      include: { students: true }
    });
    res.status(201).json(teacher);
  } catch (error: any) {
    console.error("Error adding teacher:", error);
    res.status(400).json({ message: "Error adding teacher", error: error.message });
  }
};

export const getTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.userRole;
    const userId = req.userId;

    let where: any = {};
    
    if (role === 'Student') {
      // Find the student record matching this user
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const student = await prisma.student.findUnique({ 
        where: { email: user?.email || "" },
        select: { teachers: { select: { id: true } } }
      });
      const assignedTeacherIds = student?.teachers.map(t => t.id) || [];
      where.id = { in: assignedTeacherIds };
    }

    let query: any = { where };

    if (role === 'Student') {
      // Limit fields for students
      query.select = {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        department: true,
        designation: true
      };
    } else {
      // Include student assignments for Faculty/HOD
      query.include = {
        students: {
          select: { id: true, name: true, branch: true, section: true }
        }
      };
    }

    const teachers = await prisma.teacher.findMany(query);
    res.json(teachers);
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Error fetching teachers", error: error.message });
  }
};

export const getTeacherById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id: parseInt(id) },
      include: {
        students: {
          select: { id: true, name: true, email: true, branch: true, section: true }
        }
      }
    });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (error: any) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ message: "Error fetching teacher", error: error.message });
  }
};

export const updateTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: { students: true }
    });
    res.json(teacher);
  } catch (error: any) {
    console.error("Error updating teacher:", error);
    res.status(400).json({ message: "Error updating teacher", error: error.message });
  }
};

export const deleteTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Teacher deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Error deleting teacher", error: error.message });
  }
};

export const assignStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ message: "studentIds must be an array" });
    }

    const teacher = await prisma.teacher.update({
      where: { id: parseInt(id) },
      data: {
        students: {
          set: studentIds.map((sid: number) => ({ id: sid }))
        }
      },
      include: {
        students: {
          select: { id: true, name: true, branch: true, section: true }
        }
      }
    });
    res.json(teacher);
  } catch (error: any) {
    console.error("Error assigning students:", error);
    res.status(400).json({ message: "Error assigning students", error: error.message });
  }
};
