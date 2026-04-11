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
exports.updateProfile = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/authService"));
const register = async (req, res) => {
    try {
        await authService.registerUser(req.body);
        res.json({ message: "Registered" });
    }
    catch (error) {
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
        res.status(500).json({ message: "Server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { token, user } = await authService.loginUser(req.body);
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "Wrong password") {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
const logout = async (req, res) => {
    // Logout is typically handled on the frontend by removing the token
    // but this endpoint is provided for backend acknowledgement
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
                email: updatedUser.email
            }
        });
    }
    catch (error) {
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
