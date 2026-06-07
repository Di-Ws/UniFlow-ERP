"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMeeting = exports.leaveMeeting = exports.joinMeeting = exports.createMeeting = exports.getMeetings = void 0;
const db_1 = require("../config/db");
/**
 * Get all meetings accessible to the active user
 */
const getMeetings = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User context missing" });
        }
        let meetings = [];
        if (user.role === "STUDENT") {
            if (!user.student) {
                return res.status(403).json({ message: "Student profile not found" });
            }
            meetings = await db_1.prisma.virtualClassroom.findMany({
                where: {
                    departmentId: user.student.departmentId,
                    semester: user.student.semester
                },
                include: {
                    department: { select: { id: true, name: true } },
                    faculty: { select: { id: true, name: true, userId: true } },
                    course: { select: { id: true, name: true, code: true } }
                },
                orderBy: { createdAt: "desc" }
            });
        }
        else if (user.role === "FACULTY") {
            if (!user.faculty) {
                return res.status(403).json({ message: "Faculty profile not found" });
            }
            meetings = await db_1.prisma.virtualClassroom.findMany({
                where: {
                    facultyId: user.faculty.id
                },
                include: {
                    department: { select: { id: true, name: true } },
                    faculty: { select: { id: true, name: true, userId: true } },
                    course: { select: { id: true, name: true, code: true } }
                },
                orderBy: { createdAt: "desc" }
            });
        }
        else if (user.role === "HOD") {
            // HOD manages a department
            const dept = await db_1.prisma.department.findFirst({
                where: { hodId: user.id }
            });
            if (!dept) {
                return res.status(403).json({ message: "HOD department assignment not found" });
            }
            meetings = await db_1.prisma.virtualClassroom.findMany({
                where: {
                    departmentId: dept.id
                },
                include: {
                    department: { select: { id: true, name: true } },
                    faculty: { select: { id: true, name: true, userId: true } },
                    course: { select: { id: true, name: true, code: true } }
                },
                orderBy: { createdAt: "desc" }
            });
        }
        else {
            // Admin fallback
            meetings = await db_1.prisma.virtualClassroom.findMany({
                include: {
                    department: { select: { id: true, name: true } },
                    faculty: { select: { id: true, name: true, userId: true } },
                    course: { select: { id: true, name: true, code: true } }
                },
                orderBy: { createdAt: "desc" }
            });
        }
        // Dynamic Capacity Calculation (Aggregating student counts per dept + sem)
        const studentGroups = await db_1.prisma.student.groupBy({
            by: ["departmentId", "semester"],
            _count: { id: true }
        });
        const meetingsWithCap = meetings.map((m) => {
            const match = studentGroups.find((g) => g.departmentId === m.departmentId && g.semester === m.semester);
            const studentCount = match?._count.id || 0;
            // Hard structural cap is the minimum of studentCount + 1 or the capacity (which defaults to 56)
            const seatCap = Math.min(studentCount + 1, m.capacity);
            return {
                ...m,
                seatCap
            };
        });
        res.json(meetingsWithCap);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching virtual classrooms", error: error.message });
    }
};
exports.getMeetings = getMeetings;
/**
 * Create a new virtual classroom session
 */
const createMeeting = async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== "FACULTY" && user.role !== "HOD") {
            return res.status(403).json({ message: "Forbidden: Only instructors or HODs can schedule sessions" });
        }
        const { topic, departmentId, semester, meetingLink, courseId, capacity } = req.body;
        if (!topic || !departmentId || !semester || !meetingLink) {
            return res.status(400).json({ message: "Please provide topic, department, semester, and meeting link" });
        }
        let facultyId;
        if (user.role === "FACULTY") {
            if (!user.faculty) {
                return res.status(403).json({ message: "Faculty profile not found" });
            }
            facultyId = user.faculty.id;
        }
        else {
            // For HOD, they must either have a faculty profile or we use a fallback or assign to them.
            // Let's find their faculty profile if it exists, or create one, or check if they have a faculty ID.
            const facultyProfile = await db_1.prisma.faculty.findFirst({
                where: { userId: user.id }
            });
            if (!facultyProfile) {
                return res.status(403).json({ message: "HOD must have an associated Faculty profile to host classes" });
            }
            facultyId = facultyProfile.id;
        }
        const session = await db_1.prisma.virtualClassroom.create({
            data: {
                topic,
                meetingLink,
                departmentId: parseInt(departmentId),
                semester: parseInt(semester),
                courseId: courseId ? parseInt(courseId) : null,
                facultyId,
                capacity: capacity ? parseInt(capacity) : 56,
                activeParticipants: 0
            },
            include: {
                department: { select: { id: true, name: true } },
                faculty: { select: { id: true, name: true, userId: true } }
            }
        });
        res.status(201).json({ message: "Session created successfully", session });
    }
    catch (error) {
        res.status(500).json({ message: "Error scheduling virtual classroom", error: error.message });
    }
};
exports.createMeeting = createMeeting;
/**
 * Join meeting and increment active participant count
 */
const joinMeeting = async (req, res) => {
    try {
        const meeting = req.meeting; // Set in verifyGatekeeper
        // Increment seat counter
        const updated = await db_1.prisma.virtualClassroom.update({
            where: { id: meeting.id },
            data: { activeParticipants: { increment: 1 } }
        });
        // Return raw meeting link securely (obfuscated from general query APIs)
        res.json({
            message: "Authorized",
            meetingLink: meeting.meetingLink,
            activeParticipants: updated.activeParticipants
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error joining virtual classroom", error: error.message });
    }
};
exports.joinMeeting = joinMeeting;
/**
 * Leave meeting and decrement active participant count
 */
const leaveMeeting = async (req, res) => {
    try {
        const meetingId = parseInt(req.params.id);
        if (isNaN(meetingId)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }
        const meeting = await db_1.prisma.virtualClassroom.findUnique({
            where: { id: meetingId }
        });
        if (!meeting) {
            return res.status(404).json({ message: "Session not found" });
        }
        let updatedParticipants = meeting.activeParticipants;
        if (meeting.activeParticipants > 0) {
            const updated = await db_1.prisma.virtualClassroom.update({
                where: { id: meetingId },
                data: { activeParticipants: { decrement: 1 } }
            });
            updatedParticipants = updated.activeParticipants;
        }
        res.json({
            message: "Seat released successfully",
            activeParticipants: updatedParticipants
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error leaving session", error: error.message });
    }
};
exports.leaveMeeting = leaveMeeting;
/**
 * Delete / End a virtual classroom session
 */
const deleteMeeting = async (req, res) => {
    try {
        const meetingId = parseInt(req.params.id);
        if (isNaN(meetingId)) {
            return res.status(400).json({ message: "Invalid session ID" });
        }
        const user = req.user;
        const meeting = await db_1.prisma.virtualClassroom.findUnique({
            where: { id: meetingId },
            include: { department: true }
        });
        if (!meeting) {
            return res.status(404).json({ message: "Session not found" });
        }
        // Check permissions: creator faculty or HOD of department
        let hasPermission = false;
        if (user.role === "HOD") {
            const managedDept = await db_1.prisma.department.findFirst({
                where: { hodId: user.id }
            });
            if (managedDept && managedDept.id === meeting.departmentId) {
                hasPermission = true;
            }
        }
        else if (user.role === "FACULTY" && user.faculty) {
            if (meeting.facultyId === user.faculty.id) {
                hasPermission = true;
            }
        }
        if (!hasPermission) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to end this session" });
        }
        await db_1.prisma.virtualClassroom.delete({
            where: { id: meetingId }
        });
        res.json({ message: "Virtual classroom session ended successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error ending session", error: error.message });
    }
};
exports.deleteMeeting = deleteMeeting;
