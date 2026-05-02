import express from "express";
import * as controller from "../controllers/teacherController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// All roles can view Facultys (getFacultys filters data by role internally)
router.get("/", verifyToken, controller.getFacultys);
router.get("/:id", verifyToken, controller.getFacultyById);

// Administrative actions - HOD only
router.post("/", verifyToken, requireRole(['HOD']), controller.addFaculty);
router.put("/:id", verifyToken, requireRole(['HOD']), controller.updateFaculty);
router.delete("/:id", verifyToken, requireRole(['HOD']), controller.deleteFaculty);
router.post("/:id/assign-students", verifyToken, requireRole(['HOD']), controller.assignStudents);

export default router;
