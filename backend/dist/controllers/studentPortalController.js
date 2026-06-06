"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourseMaterials = exports.payFee = exports.getSyllabus = exports.getMonthlyProgress = exports.updateStudentProfile = exports.getStudentPortalData = void 0;
const db_1 = require("../config/db");
/**
 * Get all data for the Student Portal dashboard
 */
const getStudentPortalData = async (req, res) => {
    try {
        const userId = req.userId;
        // Auto-correct: If this student has feeStatus !== 'Paid' but feeDue <= 0, set feeDue to 5000
        await db_1.prisma.student.updateMany({
            where: {
                userId,
                feeStatus: { not: "Paid" },
                feeDue: { lte: 0 }
            },
            data: {
                feeDue: 5000
            }
        });
        // Include courses and map faculty for "TBA" logic
        const studentWithCourses = await db_1.prisma.student.findUnique({
            where: { userId },
            include: {
                assignments: { orderBy: { dueDate: 'asc' } },
                transactions: { orderBy: { date: 'desc' } },
                academicReports: true,
                attendanceRecords: true,
                department: true,
                courses: {
                    include: { faculty: true }
                }
            }
        });
        if (!studentWithCourses)
            return res.status(404).json({ message: "Student profile not found" });
        const sanitizedCourses = studentWithCourses.courses.map(course => ({
            ...course,
            faculty: course.faculty.length > 0
                ? course.faculty.map(f => ({ name: f.name, email: f.email }))
                : [{ name: "TBA", email: "N/A" }]
        }));
        res.json({
            ...studentWithCourses,
            courses: sanitizedCourses
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching portal data", error: error.message });
    }
};
exports.getStudentPortalData = getStudentPortalData;
/**
 * Update student profile (phone, photo, guardian, next of kin)
 */
const updateStudentProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { phone, photoUrl, address, guardianName, guardianPhone, guardianAddress, nextOfKinName, nextOfKinPhone } = req.body;
        const updatedStudent = await db_1.prisma.student.update({
            where: { userId },
            data: {
                phone, photoUrl, address,
                guardianName, guardianPhone, guardianAddress,
                nextOfKinName, nextOfKinPhone
            }
        });
        res.json({ message: "Profile updated successfully", student: updatedStudent });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
};
exports.updateStudentProfile = updateStudentProfile;
/**
 * Get monthly progress for Recharts
 */
const getMonthlyProgress = async (req, res) => {
    try {
        const userId = req.userId;
        const student = await db_1.prisma.student.findUnique({ where: { userId }, select: { id: true } });
        if (!student)
            return res.status(404).json({ message: "Student not found" });
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Fetch attendance for the month
        const attendance = await db_1.prisma.attendance.groupBy({
            by: ['status'],
            where: {
                studentId: student.id,
                date: { gte: startOfMonth }
            },
            _count: true
        });
        // Fetch academic reports for the month
        const reports = await db_1.prisma.academicReport.findMany({
            where: {
                studentId: student.id,
                // Since we don't have a date on AcademicReport, we'll assume current month's latest ones
                // In a real app, you'd have a createdAt field
            }
        });
        const present = attendance.find(a => a.status === 'PRESENT')?._count || 0;
        const absent = attendance.find(a => a.status === 'ABSENT')?._count || 0;
        const total = present + absent;
        const attendanceRate = total > 0 ? (present / total) * 100 : 0;
        const avgMarks = reports.length > 0
            ? reports.reduce((acc, r) => acc + r.marks, 0) / reports.length
            : 0;
        res.json({
            month: now.toLocaleString('default', { month: 'short' }),
            attendanceRate: Math.round(attendanceRate),
            averageMarks: Math.round(avgMarks)
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching progress", error: error.message });
    }
};
exports.getMonthlyProgress = getMonthlyProgress;
/**
 * Get syllabus (courses) for the current student's semester and department
 */
const getSyllabus = async (req, res) => {
    try {
        const userId = req.userId;
        console.log(`[SyllabusAPI] Fetching for userId: ${userId}`);
        const student = await db_1.prisma.student.findUnique({
            where: { userId },
            select: { departmentId: true, semester: true }
        });
        if (!student) {
            console.warn(`[SyllabusAPI] No student profile found for userId: ${userId}`);
            return res.status(404).json({ message: "Student profile not found" });
        }
        console.log(`[SyllabusAPI] Student ${userId} is in Dept ${student.departmentId}, Sem ${student.semester}`);
        const syllabus = await db_1.prisma.course.findMany({
            where: {
                departmentId: student.departmentId,
                semester: student.semester
            },
            include: {
                faculty: {
                    select: { name: true, email: true }
                }
            }
        });
        console.log(`[SyllabusAPI] Found ${syllabus.length} courses for student ${userId}`);
        res.json(syllabus);
    }
    catch (error) {
        console.error("[SyllabusAPI] Error:", error);
        res.status(500).json({ message: "Error fetching syllabus", error: error.message });
    }
};
exports.getSyllabus = getSyllabus;
/**
 * Mock payment for the student fee
 */
const payFee = async (req, res) => {
    try {
        const userId = req.userId;
        const { paymentMethod } = req.body; // e.g., 'Card' or 'UPI'
        if (!paymentMethod || !['Card', 'UPI'].includes(paymentMethod)) {
            return res.status(400).json({ message: "Invalid payment method. Must be 'Card' or 'UPI'." });
        }
        const student = await db_1.prisma.student.findUnique({
            where: { userId },
            select: { id: true, feeDue: true, feeStatus: true }
        });
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        if (student.feeDue <= 0 || student.feeStatus === 'Paid') {
            return res.status(400).json({ message: "No pending fees to pay" });
        }
        const amountPaid = student.feeDue;
        // Start database transaction
        const result = await db_1.prisma.$transaction(async (tx) => {
            // 1. Update Student
            const updatedStudent = await tx.student.update({
                where: { id: student.id },
                data: {
                    feeStatus: 'Paid',
                    feeDue: 0,
                    lastPaymentDate: new Date(),
                    feePermitted: false,
                    feePermissionReason: null
                }
            });
            // 2. Create Transaction record
            const transaction = await tx.transaction.create({
                data: {
                    amount: amountPaid,
                    status: 'SUCCESS',
                    description: `Semester Fee Payment via ${paymentMethod}`,
                    studentId: student.id
                }
            });
            return { updatedStudent, transaction };
        });
        res.json({
            message: "Payment processed successfully",
            transaction: result.transaction
        });
    }
    catch (error) {
        console.error("Fee Payment Error:", error);
        res.status(500).json({ message: "Error processing payment", error: error.message });
    }
};
exports.payFee = payFee;
/**
 * Get all course materials for the student's enrolled courses
 */
const getCourseMaterials = async (req, res) => {
    try {
        const userId = req.userId;
        const student = await db_1.prisma.student.findUnique({
            where: { userId },
            select: { departmentId: true, semester: true }
        });
        if (!student) {
            return res.status(404).json({ message: "Student profile not found" });
        }
        // Read query parameters
        const { semester, departmentId, search, searchMode } = req.query;
        const courseWhere = {};
        // Filter by department
        if (departmentId && departmentId !== "") {
            courseWhere.departmentId = Number(departmentId);
        }
        else {
            // Default to student's department
            courseWhere.departmentId = student.departmentId;
        }
        // Filter by semester
        if (semester && semester !== "all" && semester !== "") {
            courseWhere.semester = Number(semester);
        }
        else if (!semester || semester === "") {
            // Default to student's current semester if not specified
            courseWhere.semester = student.semester;
        }
        // Find courses matching criteria
        const courses = await db_1.prisma.course.findMany({
            where: courseWhere,
            select: { id: true }
        });
        const courseIds = courses.map(c => c.id);
        // Build material where clause
        const materialWhere = {
            courseId: { in: courseIds }
        };
        if (search && search !== "") {
            const searchStr = String(search);
            if (searchMode === "faculty") {
                materialWhere.faculty = { name: { contains: searchStr } };
            }
            else {
                materialWhere.OR = [
                    { title: { contains: searchStr } },
                    { description: { contains: searchStr } },
                    { course: { name: { contains: searchStr } } },
                    { course: { code: { contains: searchStr } } }
                ];
            }
        }
        const materials = await db_1.prisma.courseMaterial.findMany({
            where: materialWhere,
            include: {
                course: { select: { name: true, code: true, semester: true, departmentId: true } },
                faculty: { select: { name: true, email: true, id: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(materials);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching course materials", error: error.message });
    }
};
exports.getCourseMaterials = getCourseMaterials;
