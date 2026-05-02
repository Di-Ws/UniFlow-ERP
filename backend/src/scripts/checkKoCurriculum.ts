import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({
    where: { name: { contains: 'ko' } },
    include: { department: true }
  });

  if (!student) {
    console.log("Student 'ko' not found.");
    return;
  }

  console.log("Student Info:", {
    id: student.id,
    name: student.name,
    semester: student.semester,
    departmentId: student.departmentId,
    departmentName: student.department?.name
  });

  const courses = await prisma.course.findMany({
    where: {
      departmentId: student.departmentId,
      semester: student.semester
    }
  });

  console.log(`Found ${courses.length} courses for Sem ${student.semester} in Dept ${student.departmentId}`);
  
  if (courses.length === 0) {
    const allCourses = await prisma.course.findMany({
      take: 5,
      include: { department: true }
    });
    console.log("Sample of existing courses in DB:", JSON.stringify(allCourses, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
