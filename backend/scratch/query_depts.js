const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const depts = await prisma.department.findMany();
  console.log("Departments in DB:", depts);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
