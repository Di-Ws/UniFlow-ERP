import express from "express";
import * as controller from "../controllers/leaveController";
import { verifyToken, requireRole } from "../middleware/authMiddleware";

const router = express.Router();

// General role-based viewing (getUserLeaves returns user specific leaves)
router.get("/", verifyToken, controller.getLeaves);
router.get("/user", verifyToken, controller.getUserLeaves);
router.post("/", verifyToken, controller.createLeave);

// Administrative actions - HOD only
router.put("/:id/status", verifyToken, requireRole(['HOD']), controller.updateLeaveStatus);

export default router;
