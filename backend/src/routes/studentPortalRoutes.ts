import { Router } from "express";
import * as controller from "../controllers/studentPortalController";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Student only access
router.get("/dashboard", verifyToken, authorizeRoles('STUDENT'), controller.getStudentPortalData);
router.patch("/profile", verifyToken, authorizeRoles('STUDENT'), controller.updateStudentProfile);
router.get("/progress", verifyToken, authorizeRoles('STUDENT'), controller.getMonthlyProgress);
router.get("/syllabus", verifyToken, authorizeRoles('STUDENT'), controller.getSyllabus);
router.post("/pay-fee", verifyToken, authorizeRoles('STUDENT'), controller.payFee);
router.get("/content", verifyToken, authorizeRoles('STUDENT'), controller.getCourseMaterials);

export default router;
