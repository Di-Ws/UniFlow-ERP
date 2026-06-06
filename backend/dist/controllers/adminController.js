"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permitStudent = exports.getUnpaidStudents = exports.getUnassignedCourses = exports.getAllFaculty = exports.assignFaculty = exports.getPendingCount = exports.approveUser = exports.getPendingUsers = void 0;
const db_1 = require("../config/db");
const getPendingUsers = async (req, res) => {
    try {
        const role = req.userRole;
        const userId = req.userId;
        const users = await db_1.prisma.user.findMany({
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
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: userId }
            });
            if (hodDept) {
                const filteredUsers = users.filter((u) => {
                    const metadata = u.registrationMetadata;
                    if (!metadata)
                        return false;
                    return String(metadata.departmentId) === String(hodDept.id);
                });
                return res.json(filteredUsers);
            }
            else {
                return res.json([]);
            }
        }
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching pending users", error: error.message });
    }
};
exports.getPendingUsers = getPendingUsers;
const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // APPROVED or REJECTED
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use APPROVED or REJECTED." });
        }
        const user = await db_1.prisma.user.update({
            where: { id: Number(id) },
            data: { status },
            include: { student: true, faculty: true }
        });
        // Automatically create profile if approved and doesn't exist
        if (status === 'APPROVED') {
            const defaultDept = await db_1.prisma.department.findFirst() ||
                await db_1.prisma.department.create({ data: { name: 'General' } });
            const metadata = user.registrationMetadata || {};
            const targetDeptId = metadata.departmentId ? Number(metadata.departmentId) : defaultDept.id;
            if (user.role === 'STUDENT' && !user.student) {
                await db_1.prisma.student.create({
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
            }
            else if (user.role === 'FACULTY' && !user.faculty) {
                await db_1.prisma.faculty.create({
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
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(500).json({ message: "Error updating user status", error: error.message });
    }
};
exports.approveUser = approveUser;
const getPendingCount = async (req, res) => {
    try {
        const role = req.userRole;
        const userId = req.userId;
        if (role === 'HOD') {
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: userId }
            });
            if (!hodDept) {
                return res.json({ count: 0 });
            }
            const users = await db_1.prisma.user.findMany({
                where: { status: 'PENDING' },
                select: { registrationMetadata: true }
            });
            const count = users.filter((u) => {
                const metadata = u.registrationMetadata;
                return metadata && String(metadata.departmentId) === String(hodDept.id);
            }).length;
            return res.json({ count });
        }
        const count = await db_1.prisma.user.count({
            where: { status: 'PENDING' }
        });
        res.json({ count });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching pending count" });
    }
};
exports.getPendingCount = getPendingCount;
/**
 * Assign a faculty member to a course
 */
const assignFaculty = async (req, res) => {
    try {
        const { courseId, facultyId } = req.body;
        await db_1.prisma.course.update({
            where: { id: parseInt(courseId) },
            data: {
                faculty: {
                    connect: { id: parseInt(facultyId) }
                }
            }
        });
        res.json({ message: "Faculty assigned successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Assignment failed", error: error.message });
    }
};
exports.assignFaculty = assignFaculty;
/**
 * Get all faculty for dropdowns
 */
const getAllFaculty = async (req, res) => {
    try {
        const role = req.userRole;
        const userId = req.userId;
        let where = {};
        if (role === 'HOD') {
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
        const faculty = await db_1.prisma.faculty.findMany({
            where,
            select: { id: true, name: true, email: true }
        });
        res.json(faculty);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching faculty", error: error.message });
    }
};
exports.getAllFaculty = getAllFaculty;
const getUnassignedCourses = async (req, res) => {
    try {
        let { deptName } = req.query;
        if (!deptName && req.userRole === 'HOD') {
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: req.userId }
            });
            if (hodDept) {
                deptName = hodDept.name;
            }
        }
        const courses = await db_1.prisma.course.findMany({
            where: {
                department: { name: { contains: deptName } },
                faculty: { none: {} }
            }
        });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching courses", error: error.message });
    }
};
exports.getUnassignedCourses = getUnassignedCourses;
/**
 * Get all students who have not paid fees
 */
const getUnpaidStudents = async (req, res) => {
    try {
        const role = req.userRole;
        const userId = req.userId;
        // Auto-correct: If any student has feeStatus !== 'Paid' but feeDue <= 0, set feeDue to 5000
        await db_1.prisma.student.updateMany({
            where: {
                feeStatus: { not: "Paid" },
                feeDue: { lte: 0 }
            },
            data: {
                feeDue: 5000
            }
        });
        let whereClause = {
            feeStatus: { not: "Paid" }
        };
        if (role === 'HOD') {
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: userId }
            });
            if (hodDept) {
                whereClause.departmentId = hodDept.id;
            }
            else {
                whereClause.departmentId = -1; // No department, show nothing
            }
        }
        const students = await db_1.prisma.student.findMany({
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
    }
    catch (error) {
        console.error("Error fetching unpaid students:", error);
        res.status(500).json({ message: "Error fetching unpaid students", error: error.message });
    }
};
exports.getUnpaidStudents = getUnpaidStudents;
/**
 * HOD permits/waives attendance check for an unpaid student
 */
const permitStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { permitted, reason } = req.body;
        if (permitted && !reason) {
            return res.status(400).json({ message: "A reason is required to permit attendance." });
        }
        const updatedStudent = await db_1.prisma.student.update({
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
    }
    catch (error) {
        console.error("Error updating student permit:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: "Student profile not found" });
        }
        res.status(500).json({ message: "Error updating student permission", error: error.message });
    }
};
exports.permitStudent = permitStudent;
