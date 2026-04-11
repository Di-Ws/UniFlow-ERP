import { Request, Response } from "express";
import { prisma } from "../config/db";

// Create Student
export const createStudent = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.create({
      data: req.body
    });
    res.status(201).json(student);
  } catch (error: any) {
    res.status(400).json({ message: "Error creating student", error: error.message });
  }
};

// Get All Students (with optional search)
export const getStudents = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let where = {};
    
    if (search) {
      where = {
        OR: [
          { name: { contains: String(search) } },
          { email: { contains: String(search) } },
          { branch: { contains: String(search) } },
          { section: { contains: String(search) } }
        ]
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: { academicReport: true }
    });
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};

// Get Single Student
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(req.params.id) },
      include: { academicReport: true }
    });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching student", error: error.message });
  }
};

// Update Student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const student = await prisma.student.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.json(student);
  } catch (error: any) {
    res.status(400).json({ message: "Error updating student", error: error.message });
  }
};

// Delete Student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    await prisma.student.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: "Student deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};

// Dashboard Statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalStudents = await prisma.student.count();
    
    const students = await prisma.student.findMany({
      select: { attendance: true, feeStatus: true, branch: true }
    });

    const avgAttendance = students.length > 0 
      ? (students.reduce((acc, s) => acc + s.attendance, 0) / students.length).toFixed(2) 
      : 0;
    
    const paidCount = students.filter(s => s.feeStatus.toLowerCase() === 'paid').length;
    const feePaidPercent = students.length > 0 ? ((paidCount / students.length) * 100).toFixed(2) : 0;

    const branchCounts = students.reduce((acc: any, s) => {
      acc[s.branch] = (acc[s.branch] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalStudents,
      avgAttendance,
      feePaidPercent,
      branchCounts
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};