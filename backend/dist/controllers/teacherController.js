"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeachers = exports.addTeacher = void 0;
const db_1 = require("../config/db");
const addTeacher = async (req, res) => {
    try {
        const teacher = await db_1.prisma.teacher.create({
            data: req.body
        });
        res.status(201).json(teacher);
    }
    catch (error) {
        res.status(400).json({ message: "Error adding teacher", error: error.message });
    }
};
exports.addTeacher = addTeacher;
const getTeachers = async (req, res) => {
    try {
        const teachers = await db_1.prisma.teacher.findMany();
        res.json(teachers);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching teachers", error: error.message });
    }
};
exports.getTeachers = getTeachers;
