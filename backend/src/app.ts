import express from "express";
import cors from "cors";

import studentRoutes from "./routes/studentRoutes";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import eventRoutes from "./routes/eventRoutes";
import { verifyToken } from "./middleware/authMiddleware";

const app = express();

app.use(cors({
  origin: ["http://localhost:3001", "http://127.0.0.1:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

/*
MAIN ROUTES
*/
app.use("/students", studentRoutes);
app.use("/reports", reportRoutes);
app.use("/teachers", teacherRoutes);
app.use("/events", eventRoutes);
app.use("/auth", authRoutes);

export default app;