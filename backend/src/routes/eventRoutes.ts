import express from "express";
import * as controller from "../controllers/eventController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", verifyToken, controller.addEvent);
router.get("/", verifyToken, controller.getEvents);

export default router;
