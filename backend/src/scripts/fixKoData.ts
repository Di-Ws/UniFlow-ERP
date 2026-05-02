import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cseDept = await prisma.department.findFirst({ 
    where: { name: { contains: 'CSE' } } 
  });
  
  if (!cseDept) {
    console.log("CSE Department not found.");
    return;
  }

  // 1. Move all courses in this department to Semester 1 for the demo
  const courseResult = await prisma.course.updateMany({
    where: { departmentId: cseDept.id },
    data: { semester: 1 }
  });
  console.log(`Updated ${courseResult.count} courses to Semester 1.`);

  // 2. Ensure students are in CSE Semester 1
  const result = await prisma.student.updateMany({
    where: { 
      OR: [
        { name: { contains: 'ko' } },
        { name: { contains: 'lo' } }
      ]
    },
    data: { 
      departmentId: cseDept.id,
      semester: 1 
    }
  });

  console.log(`Successfully synced ${result.count} students to CSE Semester 1.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
