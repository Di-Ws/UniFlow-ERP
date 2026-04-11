import express from "express";
import * as controller from "../controllers/studentController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyToken, controller.createStudent);
router.get("/", verifyToken, controller.getStudents);
router.get("/stats", verifyToken, controller.getDashboardStats);
router.get("/:id", verifyToken, controller.getStudentById);
router.put("/:id", verifyToken, controller.updateStudent);
router.delete("/:id", verifyToken, controller.deleteStudent);

export default router;