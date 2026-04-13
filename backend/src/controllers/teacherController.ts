import { Request, Response } from "express";
import { prisma } from "../config/db";

export const addTeacher = async (req: Request, res: Response) => {
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

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        students: {
          select: { id: true, name: true, branch: true, section: true }
        }
      }
    });
    res.json(teachers);
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Error fetching teachers", error: error.message });
  }
};

export const getTeacherById = async (req: Request, res: Response) => {
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

export const updateTeacher = async (req: Request, res: Response) => {
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

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Teacher deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Error deleting teacher", error: error.message });
  }
};

export const assignStudents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentIds } = req.body; // Array of student IDs

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
