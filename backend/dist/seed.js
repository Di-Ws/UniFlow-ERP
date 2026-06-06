"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding data...');
    // 0. Create Departments
    const csDept = await prisma.department.upsert({
        where: { name: 'Computer Science' },
        update: {},
        create: { name: 'Computer Science' }
    });
    const ecDept = await prisma.department.upsert({
        where: { name: 'Electronics' },
        update: {},
        create: { name: 'Electronics' }
    });
    // 1. Create Admin User (HOD of CS)
    const adminPassword = await bcryptjs_1.default.hash('Admin@123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@university.edu' },
        update: { role: client_1.Role.HOD },
        create: {
            name: 'System Admin',
            email: 'admin@university.edu',
            password: adminPassword,
            role: client_1.Role.HOD
        },
    });
    // Link Admin to CS Dept as HOD
    await prisma.department.update({
        where: { id: csDept.id },
        data: { hodId: admin.id }
    });
    // 2. Create Faculty Users and Profiles
    const facultyPassword = await bcryptjs_1.default.hash('Faculty@123', 10);
    const faculty1User = await prisma.user.upsert({
        where: { email: 'alan@university.edu' },
        update: { role: client_1.Role.FACULTY },
        create: {
            name: 'Dr. Alan Turing',
            email: 'alan@university.edu',
            password: facultyPassword,
            role: client_1.Role.FACULTY
        }
    });
    const faculty1 = await prisma.faculty.upsert({
        where: { email: 'alan@university.edu' },
        update: {},
        create: {
            userId: faculty1User.id,
            name: 'Dr. Alan Turing',
            email: 'alan@university.edu',
            phone: '555-0101',
            address: 'Mathematics Dept',
            departmentId: csDept.id,
            photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        }
    });
    const faculty2User = await prisma.user.upsert({
        where: { email: 'ada@university.edu' },
        update: { role: client_1.Role.FACULTY },
        create: {
            name: 'Dr. Ada Lovelace',
            email: 'ada@university.edu',
            password: facultyPassword,
            role: client_1.Role.FACULTY
        }
    });
    const faculty2 = await prisma.faculty.upsert({
        where: { email: 'ada@university.edu' },
        update: {},
        create: {
            userId: faculty2User.id,
            name: 'Dr. Ada Lovelace',
            email: 'ada@university.edu',
            phone: '555-0202',
            address: 'Computer Science Dept',
            departmentId: csDept.id,
            photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        }
    });
    // 3. Create Courses
    const cCourse = await prisma.course.upsert({
        where: { code: 'C' },
        update: { name: 'Programming in C', semester: 4 },
        create: {
            name: 'Programming in C',
            code: 'C',
            semester: 4,
            departmentId: csDept.id,
            faculty: { connect: { id: faculty1.id } }
        }
    });
    const cmosCourse = await prisma.course.upsert({
        where: { code: 'CMOS' },
        update: { name: 'CMOS VLSI Design', semester: 4 },
        create: {
            name: 'CMOS VLSI Design',
            code: 'CMOS',
            semester: 4,
            departmentId: csDept.id,
            faculty: { connect: { id: faculty2.id } }
        }
    });
    const cnCourse = await prisma.course.upsert({
        where: { code: 'CN' },
        update: { name: 'Computer Networks', semester: 4 },
        create: {
            name: 'Computer Networks',
            code: 'CN',
            semester: 4,
            departmentId: csDept.id,
            faculty: { connect: { id: faculty1.id } }
        }
    });
    const coaCourse = await prisma.course.upsert({
        where: { code: 'COA' },
        update: { name: 'Computer Organization & Architecture', semester: 4 },
        create: {
            name: 'Computer Organization & Architecture',
            code: 'COA',
            semester: 4,
            departmentId: csDept.id,
            faculty: { connect: { id: faculty2.id } }
        }
    });
    // 3.5 Create Course Materials (Mock Content)
    await prisma.courseMaterial.deleteMany({});
    // Category options: Assignments, Notes Synopsis/E-material, University Paper Sets, Question Bank, Syllabus, Video, Ebook, Lecture Note/OHPs/PPTs
    // C Course materials
    await prisma.courseMaterial.create({
        data: {
            title: 'C Programming Syntax Guide',
            description: 'Handout covering variables, data types, loops, and basic pointers in C.',
            fileUrl: '/uploads/C_syntax_guide.pdf',
            fileName: 'C_syntax_guide.pdf',
            category: 'Notes Synopsis/E-material',
            courseId: cCourse.id,
            facultyId: faculty1.id
        }
    });
    await prisma.courseMaterial.create({
        data: {
            title: 'Lab Assignment 1: Matrix Multiplication',
            description: 'Write a C program to multiply two matrices. Includes edge cases and sample inputs.',
            fileUrl: '/uploads/C_lab_assignment_1.pdf',
            fileName: 'C_lab_assignment_1.pdf',
            category: 'Assignments',
            courseId: cCourse.id,
            facultyId: faculty1.id
        }
    });
    await prisma.courseMaterial.create({
        data: {
            title: 'Midterm Question Bank (C Programming)',
            description: 'A compilation of past midterm exam questions and solutions for practice.',
            fileUrl: '/uploads/C_question_bank.pdf',
            fileName: 'C_question_bank.pdf',
            category: 'Question Bank',
            courseId: cCourse.id,
            facultyId: faculty1.id
        }
    });
    // CMOS Course materials
    await prisma.courseMaterial.create({
        data: {
            title: 'Introduction to MOS Transistors',
            description: 'Lecture slides explaining PMOS and NMOS transistor structure and operation modes.',
            fileUrl: '/uploads/CMOS_lecture1.pdf',
            fileName: 'CMOS_lecture1.pdf',
            category: 'Lecture Note/OHPs/PPTs',
            courseId: cmosCourse.id,
            facultyId: faculty2.id
        }
    });
    await prisma.courseMaterial.create({
        data: {
            title: 'CMOS Course Syllabus',
            description: 'Detailed weekly syllabus, grading policy, and list of reference textbooks.',
            fileUrl: '/uploads/CMOS_syllabus.pdf',
            fileName: 'CMOS_syllabus.pdf',
            category: 'Syllabus',
            courseId: cmosCourse.id,
            facultyId: faculty2.id
        }
    });
    // CN Course materials
    await prisma.courseMaterial.create({
        data: {
            title: 'TCP/IP Protocol Suite Overview',
            description: 'Comprehensive ebook chapter on the 5-layer TCP/IP reference model.',
            fileUrl: '/uploads/CN_tcp_ip_ebook.pdf',
            fileName: 'CN_tcp_ip_ebook.pdf',
            category: 'Ebook',
            courseId: cnCourse.id,
            facultyId: faculty1.id
        }
    });
    await prisma.courseMaterial.create({
        data: {
            title: 'University Paper Set (2024 - Dec)',
            description: 'Official final exam paper set from last winter term.',
            fileUrl: '/uploads/CN_final_2024.pdf',
            fileName: 'CN_final_2024.pdf',
            category: 'University Paper Sets',
            courseId: cnCourse.id,
            facultyId: faculty1.id
        }
    });
    // COA Course materials
    await prisma.courseMaterial.create({
        data: {
            title: 'Instruction Cycle & ALU Simulation',
            description: 'Recorded video lecture demonstrating instruction decoding and ALU stages.',
            fileUrl: '/uploads/COA_alu_video.mp4',
            fileName: 'COA_alu_video.mp4',
            category: 'Video',
            courseId: coaCourse.id,
            facultyId: faculty2.id
        }
    });
    // 4. Create Students
    const studentPassword = await bcryptjs_1.default.hash('Student@123', 10);
    const student1User = await prisma.user.upsert({
        where: { email: 'john@university.edu' },
        update: { role: client_1.Role.STUDENT },
        create: {
            name: 'John Smith',
            email: 'john@university.edu',
            password: studentPassword,
            role: client_1.Role.STUDENT
        }
    });
    const student1 = await prisma.student.upsert({
        where: { email: 'john@university.edu' },
        update: { semester: 4 },
        create: {
            userId: student1User.id,
            name: 'John Smith',
            email: 'john@university.edu',
            phone: '123-456-7890',
            address: '123 University Ave',
            departmentId: csDept.id,
            batch: '2022-2026',
            year: 2,
            semester: 4,
            faculty: { connect: { id: faculty1.id } },
            courses: { connect: [{ id: cCourse.id }, { id: cmosCourse.id }, { id: cnCourse.id }, { id: coaCourse.id }] }
        },
    });
    // Create Mock Academic Reports for Student 1
    await prisma.academicReport.deleteMany({
        where: { studentId: student1.id }
    });
    await prisma.academicReport.createMany({
        data: [
            { studentId: student1.id, subject: "Programming in C (C)", marks: 88, grade: "A" },
            { studentId: student1.id, subject: "CMOS VLSI Design (CMOS)", marks: 64, grade: "C" },
            { studentId: student1.id, subject: "Computer Networks (CN)", marks: 55, grade: "D" },
            { studentId: student1.id, subject: "Computer Organization & Architecture (COA)", marks: 92, grade: "A+" }
        ]
    });
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
