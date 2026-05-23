import { Router } from "express";
import * as controller from "../controllers/adminController";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// HOD only access
router.get("/pending-users", verifyToken, authorizeRoles('HOD'), controller.getPendingUsers);
router.patch("/approve-user/:id", verifyToken, authorizeRoles('HOD'), controller.approveUser);
router.get("/pending-count", verifyToken, authorizeRoles('HOD'), controller.getPendingCount);
router.post("/assign-faculty", verifyToken, authorizeRoles('HOD'), controller.assignFaculty);
router.get("/faculty-list", verifyToken, authorizeRoles('HOD'), controller.getAllFaculty);
router.get("/unassigned-courses", verifyToken, authorizeRoles('HOD'), controller.getUnassignedCourses);
router.get("/unpaid-students", verifyToken, authorizeRoles('HOD'), controller.getUnpaidStudents);
router.patch("/permit-student/:id", verifyToken, authorizeRoles('HOD'), controller.permitStudent);

export default router;
