const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = ["Computer Science", "Electronics", "General", "CSE", "ECE", "AIML"];
  for (const name of depts) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    console.log(`Upserted department: ${dept.name} (ID: ${dept.id})`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
