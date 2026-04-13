import { Request, Response } from "express";
import { prisma } from "../config/db";

// Get all leaves (HOD sees all, others see only their own)
export const getLeaves = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let leaves;
    if (user?.role === "HOD") {
      leaves = await prisma.leave.findMany({ orderBy: { createdAt: "desc" } });
    } else {
      leaves = await prisma.leave.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      });
    }
    res.json(leaves);
  } catch (error: any) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ message: "Error fetching leaves", error: error.message });
  }
};

// Get leaves for the logged-in user only
export const getUserLeaves = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const leaves = await prisma.leave.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    res.json(leaves);
  } catch (error: any) {
    console.error("Error fetching user leaves:", error);
    res.status(500).json({ message: "Error fetching user leaves", error: error.message });
  }
};

// Apply for leave
export const createLeave = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const leave = await prisma.leave.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason
      }
    });
    res.status(201).json(leave);
  } catch (error: any) {
    console.error("Error creating leave:", error);
    res.status(400).json({ message: "Error creating leave", error: error.message });
  }
};

// Update leave status (HOD only)
export const updateLeaveStatus = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== "HOD") {
      return res.status(403).json({ message: "Only HOD can approve/reject leaves" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'Approved' or 'Rejected'" });
    }

    const leave = await prisma.leave.update({
      where: { id: parseInt(id) },
      data: {
        status,
        reviewedBy: user.name
      }
    });
    res.json(leave);
  } catch (error: any) {
    console.error("Error updating leave status:", error);
    res.status(400).json({ message: "Error updating leave", error: error.message });
  }
};
