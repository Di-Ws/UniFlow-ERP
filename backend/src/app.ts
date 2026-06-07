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
import meetingRoutes from "./routes/meetingRoutes";

import path from "path";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001"
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
                      /\.onrender\.com$/.test(origin) ||
                      /^http:\/\/localhost:\d+$/.test(origin) ||
                      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
app.use("/api/meetings", meetingRoutes);

// Global Error Handler to prevent crashes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Global Error:", err.stack || err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

export default app;
