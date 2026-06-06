"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaterial = exports.getUploadedMaterials = exports.uploadMaterial = exports.deleteTimetableSlot = exports.updateTimetableSlot = exports.createTimetableSlot = exports.getTimetable = exports.getMyCourses = exports.markAttendance = exports.getAssignedStudents = exports.getDashboardSummary = void 0;
const db_1 = require("../config/db");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.userId;
        // In the new schema, User -> Faculty is via Faculty.userId
        const facultyProfile = await db_1.prisma.faculty.findUnique({
            where: { userId },
            include: {
                students: { select: { id: true, name: true, batch: true, year: true } },
                timetable: true,
                department: { select: { name: true } }
            }
        });
        if (!facultyProfile) {
            // Fallback: try matching by email
            const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                return res.status(404).json({ message: "User not found" });
            const profileByEmail = await db_1.prisma.faculty.findUnique({
                where: { email: user.email },
                include: {
                    students: { select: { id: true, name: true, batch: true, year: true } },
                    timetable: true,
                    department: { select: { name: true } }
                }
            });
            if (!profileByEmail) {
                return res.status(404).json({ message: "Faculty profile not found. Please ensure HOD has linked your account." });
            }
            // Auto-link the user to this faculty profile
            await db_1.prisma.faculty.update({ where: { id: profileByEmail.id }, data: { userId } });
            return buildSummaryResponse(res, profileByEmail);
        }
        return buildSummaryResponse(res, facultyProfile);
    }
    catch (error) {
        console.error("Error fetching faculty summary:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getDashboardSummary = getDashboardSummary;
const buildSummaryResponse = async (res, faculty) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const totalStudents = faculty.students.length;
    const classesToday = faculty.timetable.filter((t) => t.dayOfWeek === today).length;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const attendanceCount = await db_1.prisma.attendance.count({
        where: {
            facultyId: faculty.id,
            date: { gte: startOfDay }
        }
    });
    res.json({
        profile: {
            id: faculty.id,
            name: faculty.name,
            department: faculty.department?.name || "N/A",
            email: faculty.email,
            phone: faculty.phone,
            photoUrl: faculty.photoUrl
        },
        analytics: {
            totalStudents,
            classesToday,
            attendanceTaken: `${attendanceCount}/${classesToday}`,
            pendingTasks: 0
        },
        timetable: faculty.timetable.filter((t) => t.dayOfWeek === today),
        announcements: await db_1.prisma.announcement.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        }),
        studentsOnLeave: await db_1.prisma.leave.findMany({
            where: {
                userRole: "STUDENT",
                status: "APPROVED",
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
            },
            take: 5
        })
    });
};
const getAssignedStudents = async (req, res) => {
    try {
        const userId = req.userId;
        const facultyProfile = await db_1.prisma.faculty.findUnique({
            where: { userId },
            include: {
                students: true
            }
        });
        if (!facultyProfile) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        res.json(facultyProfile.students);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};
exports.getAssignedStudents = getAssignedStudents;
const markAttendance = async (req, res) => {
    try {
        const { studentIds, courseId, status } = req.body;
        const userId = req.userId;
        const facultyProfile = await db_1.prisma.faculty.findUnique({ where: { userId }, select: { id: true } });
        if (!facultyProfile) {
            return res.status(403).json({ message: "Only linked faculty can mark attendance" });
        }
        const attendanceRecords = studentIds.map((sid) => ({
            studentId: sid,
            facultyId: facultyProfile.id,
            courseId: courseId || null,
            status: status || "PRESENT"
        }));
        await db_1.prisma.attendance.createMany({ data: attendanceRecords });
        res.json({ message: "Attendance marked successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error marking attendance", error: error.message });
    }
};
exports.markAttendance = markAttendance;
/**
 * Get courses assigned to the current faculty
 */
const getMyCourses = async (req, res) => {
    try {
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const courses = await db_1.prisma.course.findMany({
            where: {
                faculty: {
                    some: { id: faculty.id }
                }
            },
            select: {
                id: true,
                code: true,
                name: true,
                semester: true,
                _count: {
                    select: { students: true }
                }
            }
        });
        res.json(courses);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching assigned courses", error: error.message });
    }
};
exports.getMyCourses = getMyCourses;
// Timetable CRUD
const getTimetable = async (req, res) => {
    try {
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const timetable = await db_1.prisma.timetable.findMany({
            where: { facultyId: faculty.id },
            include: {
                course: true
            }
        });
        res.json(timetable);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching timetable", error: error.message });
    }
};
exports.getTimetable = getTimetable;
const createTimetableSlot = async (req, res) => {
    try {
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const { courseId, subject, section, room, startTime, endTime, dayOfWeek, type } = req.body;
        const slot = await db_1.prisma.timetable.create({
            data: {
                facultyId: faculty.id,
                courseId: courseId ? Number(courseId) : null,
                subject: subject || "",
                section: section || "",
                room: room || "",
                startTime: startTime || "",
                endTime: endTime || "",
                dayOfWeek: dayOfWeek || "",
                type: type || "Lecture"
            },
            include: {
                course: true
            }
        });
        res.status(201).json(slot);
    }
    catch (error) {
        res.status(400).json({ message: "Error creating timetable slot", error: error.message });
    }
};
exports.createTimetableSlot = createTimetableSlot;
const updateTimetableSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const existingSlot = await db_1.prisma.timetable.findFirst({
            where: { id: Number(id), facultyId: faculty.id }
        });
        if (!existingSlot) {
            return res.status(404).json({ message: "Timetable slot not found or access denied" });
        }
        const { courseId, subject, section, room, startTime, endTime, dayOfWeek, type } = req.body;
        const updatedSlot = await db_1.prisma.timetable.update({
            where: { id: Number(id) },
            data: {
                courseId: courseId ? Number(courseId) : null,
                subject: subject ?? existingSlot.subject,
                section: section ?? existingSlot.section,
                room: room ?? existingSlot.room,
                startTime: startTime ?? existingSlot.startTime,
                endTime: endTime ?? existingSlot.endTime,
                dayOfWeek: dayOfWeek ?? existingSlot.dayOfWeek,
                type: type ?? existingSlot.type
            },
            include: {
                course: true
            }
        });
        res.json(updatedSlot);
    }
    catch (error) {
        res.status(400).json({ message: "Error updating timetable slot", error: error.message });
    }
};
exports.updateTimetableSlot = updateTimetableSlot;
const deleteTimetableSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const existingSlot = await db_1.prisma.timetable.findFirst({
            where: { id: Number(id), facultyId: faculty.id }
        });
        if (!existingSlot) {
            return res.status(404).json({ message: "Timetable slot not found or access denied" });
        }
        await db_1.prisma.timetable.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Timetable slot deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting timetable slot", error: error.message });
    }
};
exports.deleteTimetableSlot = deleteTimetableSlot;
// Course Materials CRUD
const uploadMaterial = async (req, res) => {
    try {
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const { title, description, fileName, fileData, courseId, category } = req.body;
        if (!fileName || !fileData || !courseId) {
            return res.status(400).json({ message: "Missing required fields (fileName, fileData, courseId)" });
        }
        // Save base64 data to local file
        const fileExtension = path_1.default.extname(fileName);
        const baseName = path_1.default.basename(fileName, fileExtension).replace(/[^a-zA-Z0-9]/g, "_");
        const uniqueFileName = `${baseName}-${Date.now()}${fileExtension}`;
        const uploadsDir = path_1.default.join(__dirname, "../../uploads");
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path_1.default.join(uploadsDir, uniqueFileName);
        let fileBuffer;
        if (fileData.includes(";base64,")) {
            const parts = fileData.split(";base64,");
            fileBuffer = Buffer.from(parts[1], "base64");
        }
        else {
            fileBuffer = Buffer.from(fileData, "base64");
        }
        fs_1.default.writeFileSync(filePath, fileBuffer);
        const fileUrl = `/uploads/${uniqueFileName}`;
        const material = await db_1.prisma.courseMaterial.create({
            data: {
                title: title || fileName,
                description: description || "",
                fileUrl,
                fileName: fileName,
                category: category || "Notes Synopsis/E-material",
                courseId: Number(courseId),
                facultyId: faculty.id
            },
            include: {
                course: true
            }
        });
        res.status(201).json(material);
    }
    catch (error) {
        console.error("Error in uploadMaterial:", error);
        res.status(500).json({ message: "Error uploading course material", error: error.message });
    }
};
exports.uploadMaterial = uploadMaterial;
const getUploadedMaterials = async (req, res) => {
    try {
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const materials = await db_1.prisma.courseMaterial.findMany({
            where: { facultyId: faculty.id },
            include: {
                course: true
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(materials);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching course materials", error: error.message });
    }
};
exports.getUploadedMaterials = getUploadedMaterials;
const deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const faculty = await db_1.prisma.faculty.findUnique({ where: { userId } });
        if (!faculty) {
            return res.status(404).json({ message: "Faculty profile not found" });
        }
        const material = await db_1.prisma.courseMaterial.findFirst({
            where: { id: Number(id), facultyId: faculty.id }
        });
        if (!material) {
            return res.status(404).json({ message: "Material not found or access denied" });
        }
        // Try deleting from filesystem
        const relativePath = material.fileUrl; // e.g. /uploads/filename-123.pdf
        const absolutePath = path_1.default.join(__dirname, "../..", relativePath);
        if (fs_1.default.existsSync(absolutePath)) {
            try {
                fs_1.default.unlinkSync(absolutePath);
            }
            catch (err) {
                console.error("Failed to delete file from disk:", err.message);
            }
        }
        await db_1.prisma.courseMaterial.delete({
            where: { id: Number(id) }
        });
        res.json({ message: "Material deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting material", error: error.message });
    }
};
exports.deleteMaterial = deleteMaterial;
