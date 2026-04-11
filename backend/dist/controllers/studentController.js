"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.deleteStudent = exports.updateStudent = exports.getStudentById = exports.getStudents = exports.createStudent = void 0;
const db_1 = require("../config/db");
// Create Student
const createStudent = async (req, res) => {
    try {
        const student = await db_1.prisma.student.create({
            data: req.body
        });
        res.status(201).json(student);
    }
    catch (error) {
        res.status(400).json({ message: "Error creating student", error: error.message });
    }
};
exports.createStudent = createStudent;
// Get All Students (with optional search)
const getStudents = async (req, res) => {
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
        const students = await db_1.prisma.student.findMany({
            where,
            include: { academicReport: true }
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
            include: { academicReport: true }
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
        const student = await db_1.prisma.student.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.json(student);
    }
    catch (error) {
        res.status(400).json({ message: "Error updating student", error: error.message });
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
// Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await db_1.prisma.student.count();
        const students = await db_1.prisma.student.findMany({
            select: { attendance: true, feeStatus: true, branch: true }
        });
        const avgAttendance = students.length > 0
            ? (students.reduce((acc, s) => acc + s.attendance, 0) / students.length).toFixed(2)
            : 0;
        const paidCount = students.filter(s => s.feeStatus.toLowerCase() === 'paid').length;
        const feePaidPercent = students.length > 0 ? ((paidCount / students.length) * 100).toFixed(2) : 0;
        const branchCounts = students.reduce((acc, s) => {
            acc[s.branch] = (acc[s.branch] || 0) + 1;
            return acc;
        }, {});
        res.json({
            totalStudents,
            avgAttendance,
            feePaidPercent,
            branchCounts
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching stats", error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
