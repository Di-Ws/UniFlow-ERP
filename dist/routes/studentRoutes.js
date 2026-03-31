"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controller = __importStar(require("../controllers/studentController"));
const studentService_1 = require("../services/studentService");
const db_1 = require("../config/db");
const router = express_1.default.Router();
router.post("/", controller.createStudent);
router.get("/", controller.getStudents);
router.get("/topper", controller.topper);
router.get("/analytics", controller.analytics);
router.get("/class-average", async (req, res) => {
    const result = await (0, studentService_1.getClassAverage)();
    res.json(result);
});
router.get("/failed-students", async (req, res) => {
    const students = await db_1.prisma.student.findMany();
    const failed = students.filter((s) => (0, studentService_1.calculateResult)(s).grade === 'F');
    res.json(failed);
});
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const deletedStudent = await db_1.prisma.student.delete({
            where: { id }
        });
        res.json({
            message: "Student deleted Successfully",
            deletedStudent
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({
                message: "Student not found"
            });
        }
        else {
            res.status(500).json({
                message: "Error deleting student",
                error: error.message
            });
        }
    }
});
exports.default = router;
