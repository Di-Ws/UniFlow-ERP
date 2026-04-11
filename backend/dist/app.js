"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const studentRoutes_1 = __importDefault(require("./routes/studentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const teacherRoutes_1 = __importDefault(require("./routes/teacherRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
/*
MAIN ROUTES
*/
app.use("/students", studentRoutes_1.default);
app.use("/reports", reportRoutes_1.default);
app.use("/teachers", teacherRoutes_1.default);
app.use("/events", eventRoutes_1.default);
app.use("/auth", authRoutes_1.default);
exports.default = app;
