import { Router } from 'express';
import { markBulkAttendance } from '../controllers/attendanceController';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Only Faculty and HOD can mark attendance
router.post('/bulk', verifyToken, authorizeRoles('FACULTY', 'HOD'), markBulkAttendance);

export default router;
