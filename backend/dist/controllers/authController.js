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
exports.getDepartments = exports.updateProfile = exports.getCurrentUser = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/authService"));
const db_1 = require("../config/db");
const register = async (req, res) => {
    try {
        await authService.registerUser(req.body);
        res.json({ message: "Registered" });
    }
    catch (error) {
        console.error("Register Error Details:", error);
        // Basic mapping of specific service errors to 400 Bad Request
        const clientErrors = [
            "User with this email already exists",
            "Name must be at least 2 characters long",
            "Please provide a valid email address",
            "Password must be at least 8 characters long and contain both letters and numbers"
        ];
        if (clientErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { accessToken, refreshToken, user } = await authService.loginUser(req.body);
        // Set refresh token in HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                managedDept: user.managedDept ? { id: user.managedDept.id, name: user.managedDept.name } : null
            }
        });
    }
    catch (error) {
        console.error("Login Error Details:", error);
        if (error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Wrong password") {
            return res.status(401).json({ message: error.message });
        }
        if (error.message === "Your account is awaiting HOD approval") {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error: " + error.message });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" });
    }
    try {
        const { accessToken, user } = await authService.refreshAccessToken(refreshToken);
        res.json({
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                managedDept: user.managedDept ? { id: user.managedDept.id, name: user.managedDept.name } : null
            }
        });
    }
    catch (error) {
        res.status(401).json({ message: error.message });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        await authService.revokeRefreshToken(refreshToken);
    }
    res.clearCookie('refreshToken');
    res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
const getCurrentUser = async (req, res) => {
    try {
        const user = await authService.getUserById(req.userId);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getCurrentUser = getCurrentUser;
const updateProfile = async (req, res) => {
    try {
        const updatedUser = await authService.updateUser(req.userId, req.body);
        res.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                managedDept: updatedUser.managedDept ? { id: updatedUser.managedDept.id, name: updatedUser.managedDept.name } : null
            }
        });
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        const clientErrors = [
            "User with this email already exists",
            "Name must be at least 2 characters long",
            "Please provide a valid email address",
            "Password must be at least 8 characters long and contain both letters and numbers"
        ];
        if (clientErrors.includes(error.message)) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateProfile = updateProfile;
/**
 * Get all departments for public registration dropdown
 */
const getDepartments = async (req, res) => {
    try {
        const depts = await db_1.prisma.department.findMany({
            select: { id: true, name: true }
        });
        res.json(depts);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching departments" });
    }
};
exports.getDepartments = getDepartments;
