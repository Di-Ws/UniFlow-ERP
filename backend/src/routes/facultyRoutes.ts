import express from "express";
import * as controller from "../controllers/facultyController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// Faculty specific dashboard routes
router.get("/summary", verifyToken, requireRole(['FACULTY']), controller.getDashboardSummary);
router.get("/students", verifyToken, requireRole(['FACULTY']), controller.getAssignedStudents);
router.post("/attendance", verifyToken, requireRole(['FACULTY']), controller.markAttendance);
router.get("/my-courses", verifyToken, requireRole(['FACULTY']), controller.getMyCourses);

// Timetable CRUD
router.get("/timetable", verifyToken, requireRole(['FACULTY']), controller.getTimetable);
router.post("/timetable", verifyToken, requireRole(['FACULTY']), controller.createTimetableSlot);
router.put("/timetable/:id", verifyToken, requireRole(['FACULTY']), controller.updateTimetableSlot);
router.delete("/timetable/:id", verifyToken, requireRole(['FACULTY']), controller.deleteTimetableSlot);

// Course materials CRUD
router.get("/content", verifyToken, requireRole(['FACULTY']), controller.getUploadedMaterials);
router.post("/content", verifyToken, requireRole(['FACULTY']), controller.uploadMaterial);
router.delete("/content/:id", verifyToken, requireRole(['FACULTY']), controller.deleteMaterial);

export default router;
