"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller = __importStar(require("../controllers/facultyController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Faculty specific dashboard routes
router.get("/summary", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.getDashboardSummary);
router.get("/students", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.getAssignedStudents);
router.post("/attendance", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.markAttendance);
router.get("/my-courses", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.getMyCourses);
// Timetable CRUD
router.get("/timetable", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.getTimetable);
router.post("/timetable", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.createTimetableSlot);
router.put("/timetable/:id", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.updateTimetableSlot);
router.delete("/timetable/:id", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.deleteTimetableSlot);
// Course materials CRUD
router.get("/content", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.getUploadedMaterials);
router.post("/content", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.uploadMaterial);
router.delete("/content/:id", authMiddleware_1.verifyToken, (0, authMiddleware_1.requireRole)(['FACULTY']), controller.deleteMaterial);
exports.default = router;
