"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const db_1 = require("../config/db");
// Create Student
const createStudent = async (req, res) => {
    try {
        const { department, ...rest } = req.body;
        const dept = await db_1.prisma.department.upsert({
            where: { name: department || "General" },
            update: {},
            create: { name: department || "General" }
        });
        const student = await db_1.prisma.student.create({
            data: {
                ...rest,
                departmentId: dept.id
            }
        });
        res.status(201).json(student);
    }
    catch (error) {
        res.status(400).json({ message: "Error creating student: " + error.message });
    }
};
exports.createStudent = createStudent;
// Get All Students (with optional search) - Role Aware
const getStudents = async (req, res) => {
    try {
        const { search } = req.query;
        const role = req.userRole;
        const userId = req.userId;
        let where = {};
        // Add search filter if present (using new schema fields)
        if (search) {
            where.OR = [
                { name: { contains: String(search) } },
                { email: { contains: String(search) } },
                { batch: { contains: String(search) } }
            ];
        }
        // Role-based filtering
        if (role === 'FACULTY') {
            // Find the Faculty record matching this user
            const facultyProfile = await db_1.prisma.faculty.findUnique({
                where: { userId },
                select: { students: { select: { id: true } } }
            });
            const assignedStudentIds = facultyProfile?.students.map(s => s.id) || [];
            where.id = { in: assignedStudentIds };
            where.user = { status: 'APPROVED' }; // Only show approved students
        }
        else if (role === 'HOD') {
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: userId }
            });
            if (hodDept) {
                where.departmentId = hodDept.id;
            }
            else {
                where.departmentId = -1; // No department, show nothing
            }
            where.user = { status: 'APPROVED' };
        }
        else if (role === 'STUDENT') {
            // Students only see themselves
            const user = await db_1.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
            where.email = user?.email || "";
        }
        const students = await db_1.prisma.student.findMany({
            where,
            include: {
                academicReports: true,
                department: { select: { name: true } },
                faculty: { select: { id: true, name: true, email: true } }
            }
        });
        res.json(students);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};
exports.getStudents = getStudents;
// Get Single Student
const getStudentById = async (req, res) => {
    try {
        const student = await db_1.prisma.student.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                academicReports: true,
                department: { select: { name: true } },
                faculty: { select: { id: true, name: true } },
                courses: { select: { id: true, name: true, code: true } }
            }
        });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching student", error: error.message });
    }
};
exports.getStudentById = getStudentById;
// Update Student
const updateStudent = async (req, res) => {
    try {
        const { department, ...rest } = req.body;
        let data = { ...rest };
        if (department) {
            const dept = await db_1.prisma.department.upsert({
                where: { name: department },
                update: {},
                create: { name: department }
            });
            data.departmentId = dept.id;
        }
        const student = await db_1.prisma.student.update({
            where: { id: Number(req.params.id) },
            data
        });
        res.json(student);
    }
    catch (error) {
        res.status(400).json({ message: "Error updating student: " + error.message });
    }
};
exports.updateStudent = updateStudent;
// Delete Student
const deleteStudent = async (req, res) => {
    try {
        await db_1.prisma.student.delete({
            where: { id: Number(req.params.id) }
        });
        res.json({ message: "Student deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting student", error: error.message });
    }
};
exports.deleteStudent = deleteStudent;
// Dashboard Statistics - Role Aware
const getDashboardStats = async (req, res) => {
    try {
        const role = req.userRole;
        const userId = req.userId;
        let students = [];
        if (role === 'HOD') {
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: userId }
            });
            if (hodDept) {
                students = await db_1.prisma.student.findMany({
                    where: { departmentId: hodDept.id },
                    select: { attendanceRate: true, feeStatus: true, departmentId: true }
                });
            }
            else {
                students = [];
            }
        }
        else if (role === 'FACULTY') {
            const facultyProfile = await db_1.prisma.faculty.findUnique({
                where: { userId },
                include: { students: { select: { attendanceRate: true, feeStatus: true } } }
            });
            students = facultyProfile?.students || [];
        }
        else if (role === 'STUDENT') {
            const user = await db_1.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
            const student = await db_1.prisma.student.findUnique({
                where: { email: user?.email || "" },
                select: { attendanceRate: true, feeStatus: true, departmentId: true }
            });
            students = student ? [student] : [];
        }
        const totalStudents = students.length;
        const avgAttendance = totalStudents > 0
            ? (students.reduce((acc, s) => acc + s.attendanceRate, 0) / totalStudents).toFixed(2)
            : 0;
        const paidCount = students.filter(s => s.feeStatus?.toLowerCase() === 'paid').length;
        const feePaidPercent = totalStudents > 0 ? ((paidCount / totalStudents) * 100).toFixed(2) : 0;
        // Calculate branch distribution for HODs
        let branchCounts = {};
        if (role === 'HOD') {
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: userId },
                include: { _count: { select: { students: true } } }
            });
            if (hodDept) {
                branchCounts[hodDept.name] = hodDept._count.students;
            }
        }
        res.json({
            totalStudents,
            avgAttendance: parseFloat(String(avgAttendance)),
            feePaidPercent: parseFloat(String(feePaidPercent)),
            branchCounts: branchCounts // Return empty object if no depts found
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching stats", error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
