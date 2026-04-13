import express from "express";
import * as controller from "../controllers/teacherController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, controller.getTeachers);
router.get("/:id", verifyToken, controller.getTeacherById);
router.post("/", verifyToken, controller.addTeacher);
router.put("/:id", verifyToken, controller.updateTeacher);
router.delete("/:id", verifyToken, controller.deleteTeacher);
router.post("/:id/assign-students", verifyToken, controller.assignStudents);

export default router;
