import express from "express";
import * as controller from "../controllers/studentController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// Viewing students (filtered by role internally in the controller)
router.get("/", verifyToken, controller.getStudents);
router.get("/stats", verifyToken, controller.getDashboardStats);
router.get("/:id", verifyToken, controller.getStudentById);

// Management actions - HOD and Faculty only
router.post("/", verifyToken, requireRole(['HOD', 'FACULTY']), controller.createStudent);
router.put("/:id", verifyToken, requireRole(['HOD', 'FACULTY']), controller.updateStudent);
router.delete("/:id", verifyToken, requireRole(['HOD', 'FACULTY']), controller.deleteStudent);

export default router;
