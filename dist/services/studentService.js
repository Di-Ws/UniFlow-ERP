"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudent = createStudent;
exports.getAllStudents = getAllStudents;
exports.getTopStudent = getTopStudent;
exports.getAnalytics = getAnalytics;
exports.calculateResult = calculateResult;
exports.getClassAverage = getClassAverage;
const db_1 = require("../config/db");
const calculateAverage_1 = require("../utils/calculateAverage");
async function createStudent(data) {
    const result = calculateResult(data);
    return db_1.prisma.student.create({
        data: result
    });
}
async function getAllStudents() {
    return db_1.prisma.student.findMany();
}
async function getTopStudent() {
    const students = await db_1.prisma.student.findMany();
    if (students.length === 0)
        return null;
    const topStudent = students.reduce((top, current) => {
        const currentAvg = (0, calculateAverage_1.calculateAverage)(current);
        const topAvg = (0, calculateAverage_1.calculateAverage)(top);
        return currentAvg > topAvg ? current : top;
    });
    return topStudent;
}
async function getAnalytics() {
    const students = await db_1.prisma.student.findMany();
    return {
        totalStudents: students.length,
        passCount: students.filter((s) => (0, calculateAverage_1.calculateAverage)(s) >= 60).length,
        subjectAverage: (0, calculateAverage_1.subjectAverage)(students)
    };
}
function calculateResult(student) {
    const total = student.math + student.science + student.english;
    const average = total / 3;
    let grade = 'F';
    if (average >= 90) {
        grade = 'A';
    }
    else if (average >= 80) {
        grade = 'B';
    }
    else if (average >= 70) {
        grade = 'C';
    }
    else if (average >= 60) {
        grade = 'D';
    }
    return {
        ...student, total, average, grade
    };
}
async function getClassAverage() {
    const students = await db_1.prisma.student.findMany();
    if (students.length === 0)
        return null;
    const totalMarks = students.reduce((sum, s) => sum + s.math + s.science + s.english, 0);
    const average = totalMarks / (students.length * 3);
    return {
        classAverage: average.toFixed(2)
    };
}
