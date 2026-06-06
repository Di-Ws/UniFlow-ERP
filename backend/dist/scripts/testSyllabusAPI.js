"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const userId = 14; // 'lo'
    const student = await prisma.student.findUnique({
        where: { userId },
        select: { departmentId: true, semester: true }
    });
    if (!student) {
        console.log("Student not found for userId 14");
        return;
    }
    console.log("Found student lo:", student);
    const syllabus = await prisma.course.findMany({
        where: {
            departmentId: student.departmentId,
            semester: student.semester
        },
        include: {
            faculty: {
                select: { name: true, email: true }
            }
        }
    });
    console.log(`Found ${syllabus.length} syllabus items:`);
    syllabus.forEach(s => {
        console.log(`- ${s.name} (${s.code}) | Faculty: ${s.faculty.map(f => f.name).join(', ') || 'TBA'}`);
    });
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
