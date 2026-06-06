"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        console.log("Checking database connection...");
        await prisma.$connect();
        console.log("Successfully connected to the database!");
        const userCount = await prisma.user.count();
        console.log(`Total users in DB: ${userCount}`);
    }
    catch (error) {
        console.error("Database connection failed:");
        console.error(error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
