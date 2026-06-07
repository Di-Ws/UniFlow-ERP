"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes")); // HOD faculty management (CRUD)
const facultyRoutes_1 = __importDefault(require("./routes/facultyRoutes")); // Faculty dashboard (summary, students, attendance)
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const leaveRoutes_1 = __importDefault(require("./routes/leaveRoutes"));
const attendanceRoutes_1 = __importDefault(require("./routes/attendanceRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const studentPortalRoutes_1 = __importDefault(require("./routes/studentPortalRoutes"));
const strategicRoutes_1 = __importDefault(require("./routes/strategicRoutes"));
const meetingRoutes_1 = __importDefault(require("./routes/meetingRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) ||
            /\.onrender\.com$/.test(origin) ||
            /^http:\/\/localhost:\d+$/.test(origin) ||
            /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
/*
MAIN ROUTES
*/
app.use("/api/students", studentRoutes_1.default);
app.use("/api/reports", reportRoutes_1.default);
app.use("/api/teachers", teacherRoutes_1.default); // /api/teachers — HOD admin CRUD for faculty
app.use("/api/faculty", facultyRoutes_1.default); // /api/faculty — Faculty member dashboard & actions
app.use("/api/events", eventRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/leaves", leaveRoutes_1.default);
app.use("/api/attendance", attendanceRoutes_1.default);
app.use("/api/analytics", analyticsRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
app.use("/api/student-portal", studentPortalRoutes_1.default);
app.use("/api/strategic", strategicRoutes_1.default);
app.use("/api/meetings", meetingRoutes_1.default);
// Global Error Handler to prevent crashes
app.use((err, req, res, next) => {
    console.error("Express Global Error:", err.stack || err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});
exports.default = app;
