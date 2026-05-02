import { Router } from "express";
import * as controller from "../controllers/analyticsController";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// HOD only: monthly leave comparison
router.get("/hod/leaves", verifyToken, authorizeRoles('HOD'), controller.getHODLeaveAnalytics);

// Student only: attendance summary
router.get("/student/attendance", verifyToken, authorizeRoles('STUDENT'), controller.getStudentAttendanceAnalytics);

export default router;
