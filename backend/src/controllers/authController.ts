import { Request, Response } from "express";
import * as authService from "../services/authService";

export const register = async (req: Request, res: Response) => {
  try {
    await authService.registerUser(req.body);
    res.json({ message: "Registered" });
  } catch (error: any) {
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

export const login = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Wrong password") {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  // Logout is typically handled on the frontend by removing the token
  // but this endpoint is provided for backend acknowledgement
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
        email: updatedUser.email
      }
    });
  } catch (error: any) {
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