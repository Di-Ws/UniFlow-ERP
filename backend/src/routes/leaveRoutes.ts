import express from "express";
import * as controller from "../controllers/leaveController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", verifyToken, controller.getLeaves);
router.get("/user", verifyToken, controller.getUserLeaves);
router.post("/", verifyToken, controller.createLeave);
router.put("/:id/status", verifyToken, controller.updateLeaveStatus);

export default router;
