import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import studentRoutes from "./routes/studentRoutes";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import teacherRoutes from "./routes/teacherRoutes";   // HOD faculty management (CRUD)
import facultyRoutes from "./routes/facultyRoutes";   // Faculty dashboard (summary, students, attendance)
import eventRoutes from "./routes/eventRoutes";
import leaveRoutes from "./routes/leaveRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import adminRoutes from "./routes/adminRoutes";
import studentPortalRoutes from "./routes/studentPortalRoutes";
import strategicRoutes from "./routes/strategicRoutes";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

/*
MAIN ROUTES
*/
app.use("/api/students", studentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/teachers", teacherRoutes);      // /api/teachers — HOD admin CRUD for faculty
app.use("/api/faculty", facultyRoutes);        // /api/faculty — Faculty member dashboard & actions
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student-portal", studentPortalRoutes);
app.use("/api/strategic", strategicRoutes);

// Global Error Handler to prevent crashes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Global Error:", err.stack || err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

export default app;
