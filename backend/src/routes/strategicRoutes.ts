import { Router } from "express";
import * as controller from "../controllers/strategicController";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// HOD Super Admin access
router.get("/summary", verifyToken, authorizeRoles('HOD'), controller.getStrategicSummary);

export default router;
