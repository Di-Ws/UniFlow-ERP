import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/db";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123_university_erp";

export interface GatekeeperRequest extends Request {
  userId?: number;
  userRole?: string;
  user?: any;
  meeting?: any;
}

export const verifyGatekeeper = async (
  req: GatekeeperRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Get token from HttpOnly cookies or Authorization header
  let token = req.cookies?.accessToken || req.cookies?.token;
  
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  if (!token && req.cookies?.refreshToken) {
    // If access token is not present but refresh token is, we check if we can verify the refresh token
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_456_university_erp";
    try {
      const decoded: any = jwt.verify(req.cookies.refreshToken, REFRESH_TOKEN_SECRET);
      // Fetch user from DB to verify
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { student: true, faculty: true }
      });
      if (dbUser) {
        req.userId = dbUser.id;
        req.userRole = dbUser.role;
        req.user = dbUser;
      }
    } catch (e) {
      // Ignore refresh token error, we'll return unauthorized
    }
  }

  if (!token && !req.user) {
    return res.status(401).json({ message: "Not authenticated. Session token missing." });
  }

  try {
    if (token) {
      const decoded: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
      req.userId = decoded.id;
      req.userRole = decoded.role;
      
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { student: true, faculty: true }
      });
      
      if (!dbUser) {
        return res.status(401).json({ message: "User not found." });
      }
      req.user = dbUser;
    }

    const user = req.user;

    // 2. Domain-Locking Verification
    const email = user.email.toLowerCase();
    const isAllowedDomain = email.endsWith("@college.edu.in") || email.endsWith("@university.edu");
    
    if (!isAllowedDomain) {
      return res.status(403).json({ 
        message: "Forbidden: Access restricted to institutional domain (@college.edu.in) accounts only. Personal emails are blocked." 
      });
    }

    // If request contains a meeting ID, perform room checks
    let meetingId = parseInt(req.params.id);
    if (isNaN(meetingId)) {
      const match = req.originalUrl.match(/\/meetings\/(\d+)/);
      if (match) {
        meetingId = parseInt(match[1]);
      }
    }

    if (!isNaN(meetingId)) {
      const meeting = await prisma.virtualClassroom.findUnique({
        where: { id: meetingId },
        include: {
          department: true,
          faculty: true
        }
      });

      if (!meeting) {
        return res.status(404).json({ message: "Virtual classroom session not found." });
      }
      req.meeting = meeting;

      // 3. Strict Semester Isolation (Only for Students)
      if (user.role === "STUDENT") {
        if (!user.student) {
          return res.status(403).json({ message: "Forbidden: Student profile missing." });
        }

        const student = user.student;
        const deptMismatch = student.departmentId !== meeting.departmentId;
        const semMismatch = student.semester !== meeting.semester;

        if (deptMismatch || semMismatch) {
          return res.status(403).json({ 
            message: `Forbidden: Strict semester isolation block. You are registered in ${student.semester} Semester of Dept ID ${student.departmentId}. This meeting is designated for ${meeting.semester} Semester of ${meeting.department.name}.` 
          });
        }
      }

      // 4. Dynamic Capacity Gatekeeper (The 56-Seat Rule)
      // Check active participant count
      const registeredStudentCount = await prisma.student.count({
        where: {
          departmentId: meeting.departmentId,
          semester: meeting.semester
        }
      });

      // Structural limit: student count + 1 Faculty, capped rigidly at capacity (default 56)
      const seatCap = Math.min(registeredStudentCount + 1, meeting.capacity);

      if (meeting.activeParticipants >= seatCap) {
        return res.status(403).json({ 
          message: `Forbidden: Virtual classroom capacity reached (${meeting.activeParticipants}/${seatCap} seats occupied). Enforced structural limit blocks new entries.` 
        });
      }
    }

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};
