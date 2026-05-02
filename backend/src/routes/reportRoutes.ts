import express from "express";
import * as controller from "../controllers/reportController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyToken, controller.addReport);
router.get("/:studentId", verifyToken, controller.getReportBystudentId);

export default router;
