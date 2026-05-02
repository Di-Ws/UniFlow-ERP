import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";

// Extend Express Request type
export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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

// Legacy alias for backward compatibility
export const requireRole = (allowedRoles: string[]) => authorizeRoles(...allowedRoles);
