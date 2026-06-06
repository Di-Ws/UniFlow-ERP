"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authorizeRoles = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
        }
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.verifyToken = verifyToken;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({ message: "Not authenticated" });
        }
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(", ")}`
            });
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Legacy alias for backward compatibility
const requireRole = (allowedRoles) => (0, exports.authorizeRoles)(...allowedRoles);
exports.requireRole = requireRole;
