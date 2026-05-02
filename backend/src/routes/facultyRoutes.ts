import express from "express";
import * as controller from "../controllers/facultyController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// Faculty specific dashboard routes
router.get("/summary", verifyToken, requireRole(['FACULTY']), controller.getDashboardSummary);
router.get("/students", verifyToken, requireRole(['FACULTY']), controller.getAssignedStudents);
router.post("/attendance", verifyToken, requireRole(['FACULTY']), controller.markAttendance);
router.get("/my-courses", verifyToken, requireRole(['FACULTY']), controller.getMyCourses);

export default router;
