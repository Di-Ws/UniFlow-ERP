import { Router } from "express";
import * as meetingController from "../controllers/meetingController";
import { verifyGatekeeper } from "../middleware/gatekeeperMiddleware";

const router = Router();

router.get("/", verifyGatekeeper, meetingController.getMeetings);
router.get("/courses", verifyGatekeeper, meetingController.getCourses);
router.post("/", verifyGatekeeper, meetingController.createMeeting);
router.post("/:id/join", verifyGatekeeper, meetingController.joinMeeting);
router.post("/:id/leave", verifyGatekeeper, meetingController.leaveMeeting);
router.delete("/:id", verifyGatekeeper, meetingController.deleteMeeting);

export default router;
