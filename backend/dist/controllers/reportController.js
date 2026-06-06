"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReportBystudentId = exports.addReport = void 0;
const db_1 = require("../config/db");
const addReport = async (req, res) => {
    try {
        const report = await db_1.prisma.academicReport.create({
            data: req.body
        });
        res.status(201).json(report);
    }
    catch (error) {
        res.status(400).json({ message: "Error adding report", error: error.message });
    }
};
exports.addReport = addReport;
const getReportBystudentId = async (req, res) => {
    try {
        const reports = await db_1.prisma.academicReport.findMany({
            where: { studentId: Number(req.params.studentId) }
        });
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
};
exports.getReportBystudentId = getReportBystudentId;
