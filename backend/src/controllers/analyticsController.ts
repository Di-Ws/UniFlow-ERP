import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * HOD Leave Analytics: Aggregates Approved vs Rejected leaves per month
 */
export const getHODLeaveAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Start of the month

    const leaves = await prisma.leave.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ['APPROVED', 'REJECTED'] }
      },
      select: {
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(months[d.getMonth()]);
    }

    const aggregatedMap: Record<string, { month: string, approved: number, rejected: number }> = {};
    last6Months.forEach(m => {
      aggregatedMap[m] = { month: m, approved: 0, rejected: 0 };
    });

    leaves.forEach(leave => {
      const monthName = months[new Date(leave.createdAt).getMonth()];
      if (aggregatedMap[monthName]) {
        if (leave.status === 'APPROVED') aggregatedMap[monthName].approved++;
        if (leave.status === 'REJECTED') aggregatedMap[monthName].rejected++;
      }
    });

    res.json(Object.values(aggregatedMap));
  } catch (error: any) {
    console.error("HOD Leave Analytics Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Student Attendance Analytics: Calculates percentage and returns pie chart data
 */
export const getStudentAttendanceAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, name: true }
    });

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    // Efficiently aggregate using Prisma's _count
    const stats = await prisma.attendance.groupBy({
      by: ['status'],
      where: { studentId: student.id },
      _count: true
    });

    const present = stats.find(s => s.status === 'PRESENT')?._count || 0;
    const absent = stats.find(s => s.status === 'ABSENT')?._count || 0;
    const total = present + absent;
    
    const percentage = total > 0 ? (present / total) * 100 : 0;
    const requirement = 75; // 75% target

    // Data format for Recharts Pie Chart
    const chartData = [
      { name: 'Present', value: present, color: '#10b981' },
      { name: 'Absent', value: absent, color: '#f43f5e' }
    ];

    res.json({
      studentName: student.name,
      totalSessions: total,
      attendancePercentage: Math.round(percentage),
      requirement,
      chartData
    });
  } catch (error: any) {
    console.error("Student Attendance Analytics Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
