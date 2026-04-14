import express from "express";
import * as controller from "../controllers/teacherController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// All roles can view teachers (getTeachers filters data by role internally)
router.get("/", verifyToken, controller.getTeachers);
router.get("/:id", verifyToken, controller.getTeacherById);

// Administrative actions - HOD only
router.post("/", verifyToken, requireRole(['HOD']), controller.addTeacher);
router.put("/:id", verifyToken, requireRole(['HOD']), controller.updateTeacher);
router.delete("/:id", verifyToken, requireRole(['HOD']), controller.deleteTeacher);
router.post("/:id/assign-students", verifyToken, requireRole(['HOD']), controller.assignStudents);

export default router;
