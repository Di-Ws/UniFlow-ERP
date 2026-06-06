"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const cseDept = await prisma.department.upsert({
        where: { name: 'CSE' },
        update: {},
        create: { name: 'CSE' }
    });
    const deptId = cseDept.id;
    // Semester 1
    const m1 = await prisma.course.upsert({
        where: { code: 'MAT101' },
        update: {},
        // @ts-ignore
        create: { name: 'Mathematics I', code: 'MAT101', credits: 4, semester: 1, departmentId: deptId }
    });
    const cp = await prisma.course.upsert({
        where: { code: 'CS101' },
        update: {},
        // @ts-ignore
        create: { name: 'Computer Programming', code: 'CS101', credits: 4, semester: 1, departmentId: deptId }
    });
    // Semester 2
    const m2 = await prisma.course.upsert({
        where: { code: 'MAT102' },
        // @ts-ignore
        update: { prerequisites: { connect: { id: m1.id } } },
        create: {
            // @ts-ignore
            name: 'Mathematics II', code: 'MAT102', credits: 4, semester: 2, departmentId: deptId,
            // @ts-ignore
            prerequisites: { connect: { id: m1.id } }
        }
    });
    const ds = await prisma.course.upsert({
        where: { code: 'CS201' },
        // @ts-ignore
        update: { prerequisites: { connect: { id: cp.id } } },
        create: {
            // @ts-ignore
            name: 'Data Structures', code: 'CS201', credits: 4, semester: 2, departmentId: deptId,
            // @ts-ignore
            prerequisites: { connect: { id: cp.id } }
        }
    });
    // Semester 3
    const algo = await prisma.course.upsert({
        where: { code: 'CS301' },
        // @ts-ignore
        update: { prerequisites: { connect: { id: ds.id } } },
        create: {
            // @ts-ignore
            name: 'Design & Analysis of Algorithms', code: 'CS301', credits: 4, semester: 3, departmentId: deptId,
            // @ts-ignore
            prerequisites: { connect: { id: ds.id } }
        }
    });
    const dbms = await prisma.course.upsert({
        where: { code: 'CS302' },
        // @ts-ignore
        update: { prerequisites: { connect: { id: ds.id } } },
        create: {
            // @ts-ignore
            name: 'Database Management Systems', code: 'CS302', credits: 4, semester: 3, departmentId: deptId,
            // @ts-ignore
            prerequisites: { connect: { id: ds.id } }
        }
    });
    console.log("Curriculum mapping for CSE completed successfully.");
}
main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
