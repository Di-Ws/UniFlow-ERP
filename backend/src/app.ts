import express from "express";
import cors from "cors";

import studentRoutes from "./routes/studentRoutes";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import eventRoutes from "./routes/eventRoutes";
import leaveRoutes from "./routes/leaveRoutes";
import { verifyToken } from "./middleware/authMiddleware";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

/*
MAIN ROUTES
*/
app.use("/api/students", studentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);

// Global Error Handler to prevent crashes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Express Global Error:", err.stack || err);
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

export default app;