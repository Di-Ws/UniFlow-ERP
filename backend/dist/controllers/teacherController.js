"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignStudents = exports.deleteFaculty = exports.updateFaculty = exports.getFacultyById = exports.getFacultys = exports.addFaculty = void 0;
const db_1 = require("../config/db");
const addFaculty = async (req, res) => {
    try {
        const { department, ...rest } = req.body;
        // Find or create department
        const dept = await db_1.prisma.department.upsert({
            where: { name: department || "General" },
            update: {},
            create: { name: department || "General" }
        });
        const Faculty = await db_1.prisma.faculty.create({
            data: {
                ...rest,
                departmentId: dept.id
            },
            include: { students: true, department: true }
        });
        res.status(201).json(Faculty);
    }
    catch (error) {
        console.error("Error adding Faculty:", error);
        res.status(400).json({ message: "Error adding Faculty: " + error.message });
    }
};
exports.addFaculty = addFaculty;
const getFacultys = async (req, res) => {
    try {
        const role = req.userRole;
        const userId = req.userId;
        let where = {};
        if (role === 'STUDENT') {
            // Find the student record matching this user
            const user = await db_1.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
            const student = await db_1.prisma.student.findUnique({
                where: { email: user?.email || "" },
                select: { faculty: { select: { id: true } } }
            });
            const assignedFacultyIds = student?.faculty.map((f) => f.id) || [];
            where.id = { in: assignedFacultyIds };
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
        }
        let query = { where };
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
        }
        else {
            // Include student assignments for Faculty/HOD
            query.include = {
                students: {
                    select: { id: true, name: true, batch: true, year: true }
                },
                department: { select: { name: true } }
            };
        }
        const Facultys = await db_1.prisma.faculty.findMany(query);
        res.json(Facultys);
    }
    catch (error) {
        console.error("Error fetching Facultys:", error);
        res.status(500).json({ message: "Error fetching Facultys", error: error.message });
    }
};
exports.getFacultys = getFacultys;
const getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;
        const Faculty = await db_1.prisma.faculty.findUnique({
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
    }
    catch (error) {
        console.error("Error fetching Faculty:", error);
        res.status(500).json({ message: "Error fetching Faculty", error: error.message });
    }
};
exports.getFacultyById = getFacultyById;
const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { department, students, ...rest } = req.body;
        let data = { ...rest };
        if (department) {
            const dept = await db_1.prisma.department.upsert({
                where: { name: department },
                update: {},
                create: { name: department }
            });
            data.departmentId = dept.id;
        }
        const Faculty = await db_1.prisma.faculty.update({
            where: { id: parseInt(id) },
            data,
            include: { students: true, department: true }
        });
        res.json(Faculty);
    }
    catch (error) {
        console.error("Error updating Faculty:", error);
        res.status(400).json({ message: "Error updating Faculty: " + error.message });
    }
};
exports.updateFaculty = updateFaculty;
const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.prisma.faculty.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Faculty deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting Faculty:", error);
        res.status(500).json({ message: "Error deleting Faculty", error: error.message });
    }
};
exports.deleteFaculty = deleteFaculty;
const assignStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const { studentIds } = req.body;
        if (!Array.isArray(studentIds)) {
            return res.status(400).json({ message: "studentIds must be an array" });
        }
        const Faculty = await db_1.prisma.faculty.update({
            where: { id: parseInt(id) },
            data: {
                students: {
                    set: studentIds.map((sid) => ({ id: sid }))
                }
            },
            include: {
                students: {
                    select: { id: true, name: true, batch: true, year: true }
                }
            }
        });
        res.json(Faculty);
    }
    catch (error) {
        console.error("Error assigning students:", error);
        res.status(400).json({ message: "Error assigning students", error: error.message });
    }
};
exports.assignStudents = assignStudents;
