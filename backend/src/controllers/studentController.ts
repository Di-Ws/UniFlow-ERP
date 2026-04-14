import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// Create Student
export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.create({
      data: req.body
    });
    res.status(201).json(student);
  } catch (error: any) {
    res.status(400).json({ message: "Error creating student", error: error.message });
  }
};

// Get All Students (with optional search) - Role Aware
export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query;
    const role = req.userRole;
    const userId = req.userId;

    let where: any = {};
    
    // Add search filter if present
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { branch: { contains: String(search) } },
        { section: { contains: String(search) } }
      ];
    }

    // Role-based filtering
    if (role === 'Faculty') {
      // Find the teacher record matching this user
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const teacher = await prisma.teacher.findUnique({ 
        where: { email: user?.email || "" },
        select: { students: { select: { id: true } } }
      });
      const assignedStudentIds = teacher?.students.map(s => s.id) || [];
      where.id = { in: assignedStudentIds };
    } else if (role === 'Student') {
      // Students only see themselves
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      where.email = user?.email || "";
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
export const getStudentById = async (req: AuthRequest, res: Response) => {
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
export const updateStudent = async (req: AuthRequest, res: Response) => {
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
export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.student.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ message: "Student deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting student", error: error.message });
  }
};

// Dashboard Statistics - Role Aware
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const role = req.userRole;
    const userId = req.userId;

    let students: any[] = [];

    if (role === 'HOD') {
      students = await prisma.student.findMany({
        select: { attendance: true, feeStatus: true, branch: true }
      });
    } else if (role === 'Faculty') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const teacher = await prisma.teacher.findUnique({ 
        where: { email: user?.email || "" },
        include: { students: { select: { attendance: true, feeStatus: true, branch: true } } }
      });
      students = teacher?.students || [];
    } else if (role === 'Student') {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      const student = await prisma.student.findUnique({
        where: { email: user?.email || "" },
        select: { attendance: true, feeStatus: true, branch: true }
      });
      students = student ? [student] : [];
    }

    const totalStudents = students.length;
    const avgAttendance = totalStudents > 0 
      ? (students.reduce((acc, s) => acc + s.attendance, 0) / totalStudents).toFixed(2) 
      : 0;
    
    const paidCount = students.filter(s => s.feeStatus.toLowerCase() === 'paid').length;
    const feePaidPercent = totalStudents > 0 ? ((paidCount / totalStudents) * 100).toFixed(2) : 0;

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