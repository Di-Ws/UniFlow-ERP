import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

const JWT_SECRET = "secret123";

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

  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    
    // Fetch role to ensure it's up to date
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    });
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
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