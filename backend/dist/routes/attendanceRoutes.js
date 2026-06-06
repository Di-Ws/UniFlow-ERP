"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only Faculty and HOD can mark attendance
router.post('/bulk', authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('FACULTY', 'HOD'), attendanceController_1.markBulkAttendance);
exports.default = router;
