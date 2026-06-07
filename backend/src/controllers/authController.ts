import { Request, Response } from "express";
import * as authService from "../services/authService";
import { prisma } from "../config/db";

export const register = async (req: Request, res: Response) => {
  try {
    await authService.registerUser(req.body);
    res.json({ message: "Registered" });
  } catch (error: any) {
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

export const login = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(req.body);
    
    // Set refresh token in HttpOnly cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        managedDept: user.managedDept ? { id: user.managedDept.id, name: user.managedDept.name } : null,
        faculty: (user as any).faculty ? { id: (user as any).faculty.id, departmentId: (user as any).faculty.departmentId, department: (user as any).faculty.department } : null,
        student: (user as any).student ? { id: (user as any).student.id, departmentId: (user as any).student.departmentId, department: (user as any).student.department } : null
      }
    });
  } catch (error: any) {
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

export const refresh = async (req: Request, res: Response) => {
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
        managedDept: (user as any).managedDept ? { id: (user as any).managedDept.id, name: (user as any).managedDept.name } : null,
        faculty: (user as any).faculty ? { id: (user as any).faculty.id, departmentId: (user as any).faculty.departmentId, department: (user as any).faculty.department } : null,
        student: (user as any).student ? { id: (user as any).student.id, departmentId: (user as any).student.departmentId, department: (user as any).student.department } : null
      }
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken);
  }
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  });
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await authService.getUserById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const updatedUser = await authService.updateUser(req.userId, req.body);
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        managedDept: (updatedUser as any).managedDept ? { id: (updatedUser as any).managedDept.id, name: (updatedUser as any).managedDept.name } : null,
        faculty: (updatedUser as any).faculty ? { id: (updatedUser as any).faculty.id, departmentId: (updatedUser as any).faculty.departmentId, department: (updatedUser as any).faculty.department } : null,
        student: (updatedUser as any).student ? { id: (updatedUser as any).student.id, departmentId: (updatedUser as any).student.departmentId, department: (updatedUser as any).student.department } : null
      }
    });
  } catch (error: any) {
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

/**
 * Get all departments for public registration dropdown
 */
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const depts = await prisma.department.findMany({
      select: { id: true, name: true }
    });
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching departments" });
  }
};
