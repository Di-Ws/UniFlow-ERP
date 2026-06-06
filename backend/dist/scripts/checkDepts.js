"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const depts = await prisma.department.findMany();
    console.log("Existing Departments:", JSON.stringify(depts, null, 2));
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
