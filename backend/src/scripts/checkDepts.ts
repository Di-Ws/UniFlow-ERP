import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const depts = await prisma.department.findMany();
  console.log("Existing Departments:", JSON.stringify(depts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
