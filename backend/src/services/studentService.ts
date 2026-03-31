import { prisma } from "../config/db";
import { Student as PrismaStudent } from "@prisma/client";

import {
    calculateAverage,
    subjectAverage
} from "../utils/calculateAverage";

import { Student } from "../types/student";

export async function createStudent(data: Omit<Student, 'id'>) {
    const result = calculateResult(data);
    return prisma.student.create({
        data : result
    });
}

export async function getAllStudents() {
    return prisma.student.findMany();
}

export async function getTopStudent() {
    const students = await prisma.student.findMany();
    if (students.length === 0) return null;

    const topStudent = students.reduce((top, current) => {
        const currentAvg = calculateAverage(current);
        const topAvg = calculateAverage(top);
        return currentAvg > topAvg ? current : top;
    }
    );
    return topStudent;      
}

export async function getAnalytics() {
    const students = await prisma.student.findMany();

    return {
        totalStudents: students.length,
        passCount: students.filter((s: Student) => calculateAverage(s) >= 60).length,
        subjectAverage: subjectAverage(students)
    };
}

export function calculateResult(student:any) {
    const total =
    student.math + student.science + student.english;

    const average = total / 3;
    let grade = 'F';
    if (average >= 90) {
        grade = 'A';
    } else if (average >= 80) {
        grade = 'B';
    } else if (average >= 70) {
        grade = 'C';
    } else if (average >= 60) {
        grade = 'D';
    }
    return { 
        ...student, total, average, grade
    };
}

export async function getClassAverage(){
    const students = await prisma.student.findMany();
    if(students.length === 0) return null;

    const totalMarks= students.reduce((sum,s) => sum + s.math + s.science + s.english, 0);

    const average = totalMarks / (students.length*3);

    return{
        classAverage:average.toFixed(2)
    };
}