"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaveStatus = exports.createLeave = exports.getUserLeaves = exports.getLeaves = void 0;
const db_1 = require("../config/db");
// Get all leaves (HOD sees all, others see only their own)
const getLeaves = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        let leaves;
        if (user?.role === "HOD") {
            const hodDept = await db_1.prisma.department.findUnique({
                where: { hodId: userId }
            });
            let whereClause = {};
            if (hodDept) {
                whereClause.user = {
                    OR: [
                        { student: { departmentId: hodDept.id } },
                        { faculty: { departmentId: hodDept.id } }
                    ]
                };
            }
            else {
                whereClause.id = -1; // Force empty result if HOD manages no department
            }
            leaves = await db_1.prisma.leave.findMany({
                where: whereClause,
                orderBy: { createdAt: "desc" },
                include: { approvedBy: { select: { name: true } } }
            });
        }
        else {
            leaves = await db_1.prisma.leave.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                include: { approvedBy: { select: { name: true } } }
            });
        }
        res.json(leaves);
    }
    catch (error) {
        console.error("Error fetching leaves:", error);
        res.status(500).json({ message: "Error fetching leaves", error: error.message });
    }
};
exports.getLeaves = getLeaves;
// Get leaves for the logged-in user only
const getUserLeaves = async (req, res) => {
    try {
        const userId = req.userId;
        const leaves = await db_1.prisma.leave.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { approvedBy: { select: { name: true } } }
        });
        res.json(leaves);
    }
    catch (error) {
        console.error("Error fetching user leaves:", error);
        res.status(500).json({ message: "Error fetching user leaves", error: error.message });
    }
};
exports.getUserLeaves = getUserLeaves;
// Apply for leave
const createLeave = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const { leaveType, startDate, endDate, reason } = req.body;
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (reason.trim().length < 10) {
            return res.status(400).json({ message: "Reason must be at least 10 characters long" });
        }
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: "End date must be after start date" });
        }
        const leave = await db_1.prisma.leave.create({
            data: {
                userId: user.id,
                userName: user.name,
                userRole: user.role,
                leaveType,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason
            }
        });
        res.status(201).json(leave);
    }
    catch (error) {
        console.error("Error creating leave:", error);
        res.status(400).json({ message: "Error creating leave", error: error.message });
    }
};
exports.createLeave = createLeave;
// Update leave status (HOD only)
const updateLeaveStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== "HOD") {
            return res.status(403).json({ message: "Only HOD can approve/reject leaves" });
        }
        const { id } = req.params;
        const { status, reviewedBy } = req.body;
        const normalizedStatus = status?.toUpperCase();
        const validStatuses = ["APPROVED", "REJECTED"];
        if (!validStatuses.includes(normalizedStatus)) {
            return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'" });
        }
        const leave = await db_1.prisma.leave.update({
            where: { id: parseInt(id) },
            data: {
                status: normalizedStatus,
                approvedById: userId // Still using token for security, but body could be used if preferred
            },
            include: {
                approvedBy: {
                    select: { name: true }
                }
            }
        });
        res.json(leave);
    }
    catch (error) {
        console.error("Error updating leave status:", error);
        res.status(400).json({ message: "Error updating leave", error: error.message });
    }
};
exports.updateLeaveStatus = updateLeaveStatus;
