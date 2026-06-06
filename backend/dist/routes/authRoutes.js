"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
/*
POST /auth/register
*/
router.post("/register", authController_1.register);
/*
POST /auth/login
*/
router.post("/login", authController_1.login);
/*
POST /auth/refresh
*/
router.post("/refresh", authController_1.refresh);
/*
POST /auth/logout
*/
router.post("/logout", authController_1.logout);
/*
GET /auth/me
*/
router.get("/me", authMiddleware_1.verifyToken, authController_1.getCurrentUser);
/*
PUT /auth/profile
*/
router.put("/profile", authMiddleware_1.verifyToken, authController_1.updateProfile);
router.get("/departments", authController_1.getDepartments);
exports.default = router;
