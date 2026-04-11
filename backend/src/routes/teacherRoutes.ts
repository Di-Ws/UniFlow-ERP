import express from "express";
import * as controller from "../controllers/teacherController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyToken, controller.addTeacher);
router.get("/", verifyToken, controller.getTeachers);

export default router;
