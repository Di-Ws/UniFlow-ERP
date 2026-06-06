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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller = __importStar(require("../controllers/adminController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// HOD only access
router.get("/pending-users", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.getPendingUsers);
router.patch("/approve-user/:id", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.approveUser);
router.get("/pending-count", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.getPendingCount);
router.post("/assign-faculty", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.assignFaculty);
router.get("/faculty-list", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.getAllFaculty);
router.get("/unassigned-courses", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.getUnassignedCourses);
router.get("/unpaid-students", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.getUnpaidStudents);
router.patch("/permit-student/:id", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRoles)('HOD'), controller.permitStudent);
exports.default = router;
