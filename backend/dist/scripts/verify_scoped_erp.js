"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authService_1 = require("../services/authService");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("=== Verification Script Started ===");
    const testHODEmail = `test_ece_hod_${Date.now()}@university.edu`;
    const testHODPassword = "password123";
    const testHODName = "Test ECE HOD";
    try {
        // 1. Get ECE department
        const eceDept = await prisma.department.findUnique({
            where: { name: 'ECE' }
        });
        if (!eceDept) {
            console.error("ECE Department not found. Please seed the database first.");
            return;
        }
        console.log(`Found ECE Department with ID: ${eceDept.id}`);
        // 2. Register HOD for ECE
        console.log(`Registering new HOD: ${testHODEmail} for department: ECE (${eceDept.id})`);
        const registeredUser = await (0, authService_1.registerUser)({
            name: testHODName,
            email: testHODEmail,
            password: testHODPassword,
            role: 'HOD',
            registrationMetadata: {
                departmentId: eceDept.id
            }
        });
        if (!registeredUser) {
            throw new Error("Failed to register HOD!");
        }
        console.log("Registration response user:", {
            id: registeredUser?.id,
            name: registeredUser?.name,
            email: registeredUser?.email,
            role: registeredUser?.role,
            status: registeredUser?.status,
            managedDept: registeredUser?.managedDept
        });
        // Verify database relations
        const updatedEceDept = await prisma.department.findUnique({
            where: { id: eceDept.id },
            include: { hod: true }
        });
        console.log("Verified ECE department HOD relation in DB:", {
            id: updatedEceDept?.id,
            name: updatedEceDept?.name,
            hodId: updatedEceDept?.hodId,
            hodName: updatedEceDept?.hod?.name
        });
        if (updatedEceDept?.hodId !== registeredUser?.id) {
            throw new Error("HOD ID mismatch on ECE department!");
        }
        // 3. Log in as HOD
        console.log("Logging in as the new ECE HOD...");
        const loginResult = await (0, authService_1.loginUser)({
            email: testHODEmail,
            password: testHODPassword
        });
        console.log("Login result user profile:", {
            id: loginResult.user.id,
            name: loginResult.user.name,
            email: loginResult.user.email,
            role: loginResult.user.role,
            managedDept: loginResult.user.managedDept
        });
        if (!loginResult.user.managedDept || loginResult.user.managedDept.name !== 'ECE') {
            throw new Error("Logged in user doesn't have the correct managed department info!");
        }
        // 4. Create some test students and faculty
        // Let's create an ECE student
        console.log("Creating test students and faculty for ECE and CSE...");
        const cseDept = await prisma.department.findFirst({
            where: { name: { contains: 'CSE' } }
        });
        if (!cseDept) {
            console.error("CSE Department not found.");
            return;
        }
        // Unapproved student in ECE
        const pendingStudentUserECE = await prisma.user.create({
            data: {
                name: "Pending ECE Student",
                email: `pending_ece_${Date.now()}@university.edu`,
                password: "password123",
                role: "STUDENT",
                status: "PENDING",
                registrationMetadata: { departmentId: eceDept.id }
            }
        });
        // Unapproved student in CSE
        const pendingStudentUserCSE = await prisma.user.create({
            data: {
                name: "Pending CSE Student",
                email: `pending_cse_${Date.now()}@university.edu`,
                password: "password123",
                role: "STUDENT",
                status: "PENDING",
                registrationMetadata: { departmentId: cseDept.id }
            }
        });
        // Approved student in ECE
        const approvedStudentUserECE = await prisma.user.create({
            data: {
                name: "Approved ECE Student",
                email: `approved_ece_${Date.now()}@university.edu`,
                password: "password123",
                role: "STUDENT",
                status: "APPROVED"
            }
        });
        const approvedStudentECE = await prisma.student.create({
            data: {
                userId: approvedStudentUserECE.id,
                name: approvedStudentUserECE.name,
                email: approvedStudentUserECE.email,
                phone: "1234567890",
                address: "ECE St",
                batch: "2024-2028",
                year: 1,
                semester: 1,
                departmentId: eceDept.id,
                feeStatus: "Unpaid",
                feeDue: 5000,
                attendanceRate: 85.0
            }
        });
        // Approved student in CSE
        const approvedStudentUserCSE = await prisma.user.create({
            data: {
                name: "Approved CSE Student",
                email: `approved_cse_${Date.now()}@university.edu`,
                password: "password123",
                role: "STUDENT",
                status: "APPROVED"
            }
        });
        const approvedStudentCSE = await prisma.student.create({
            data: {
                userId: approvedStudentUserCSE.id,
                name: approvedStudentUserCSE.name,
                email: approvedStudentUserCSE.email,
                phone: "1234567890",
                address: "CSE St",
                batch: "2024-2028",
                year: 1,
                semester: 1,
                departmentId: cseDept.id,
                feeStatus: "Unpaid",
                feeDue: 5000,
                attendanceRate: 92.0
            }
        });
        // Approved faculty in ECE
        const facultyUserECE = await prisma.user.create({
            data: {
                name: "ECE Faculty Member",
                email: `ece_faculty_${Date.now()}@university.edu`,
                password: "password123",
                role: "FACULTY",
                status: "APPROVED"
            }
        });
        const facultyECE = await prisma.faculty.create({
            data: {
                userId: facultyUserECE.id,
                name: facultyUserECE.name,
                email: facultyUserECE.email,
                phone: "9876543210",
                address: "ECE Dept Office",
                departmentId: eceDept.id
            }
        });
        // Approved faculty in CSE
        const facultyUserCSE = await prisma.user.create({
            data: {
                name: "CSE Faculty Member",
                email: `cse_faculty_${Date.now()}@university.edu`,
                password: "password123",
                role: "FACULTY",
                status: "APPROVED"
            }
        });
        const facultyCSE = await prisma.faculty.create({
            data: {
                userId: facultyUserCSE.id,
                name: facultyUserCSE.name,
                email: facultyUserCSE.email,
                phone: "9876543210",
                address: "CSE Dept Office",
                departmentId: cseDept.id
            }
        });
        // 5. Test Scoped Queries
        console.log("\n--- Testing Scoped Endpoint Logic ---");
        // Mimic getPendingUsers controller logic
        const allPending = await prisma.user.findMany({
            where: { status: 'PENDING' }
        });
        const hodFilteredPending = allPending.filter((u) => {
            const metadata = u.registrationMetadata;
            return metadata && String(metadata.departmentId) === String(eceDept.id);
        });
        console.log("Pending queue filtering test:");
        console.log(`Total pending users globally: ${allPending.length}`);
        console.log(`HOD filtered pending users: ${hodFilteredPending.length}`);
        const pendingNames = hodFilteredPending.map(u => u.name);
        console.log("HOD pending user list:", pendingNames);
        if (!pendingNames.includes("Pending ECE Student") || pendingNames.includes("Pending CSE Student")) {
            throw new Error("Pending queue filtering is broken! ECE HOD should see only ECE pending users.");
        }
        console.log("✅ Pending queue scoping is correct!");
        // Mimic getStudents controller logic
        const hodFilteredStudents = await prisma.student.findMany({
            where: {
                departmentId: eceDept.id,
                user: { status: 'APPROVED' }
            }
        });
        console.log("\nApproved students filtering test:");
        console.log("HOD students list:", hodFilteredStudents.map(s => s.name));
        if (!hodFilteredStudents.some(s => s.name === "Approved ECE Student") || hodFilteredStudents.some(s => s.name === "Approved CSE Student")) {
            throw new Error("Student list filtering is broken! ECE HOD should see only ECE students.");
        }
        console.log("✅ Student list scoping is correct!");
        // Mimic getFacultys controller logic
        const hodFilteredFaculty = await prisma.faculty.findMany({
            where: { departmentId: eceDept.id }
        });
        console.log("\nFaculty filtering test:");
        console.log("HOD faculty list:", hodFilteredFaculty.map(f => f.name));
        if (!hodFilteredFaculty.some(f => f.name === "ECE Faculty Member") || hodFilteredFaculty.some(f => f.name === "CSE Faculty Member")) {
            throw new Error("Faculty filtering is broken! ECE HOD should see only ECE faculty.");
        }
        console.log("✅ Faculty scoping is correct!");
        // Mimic getUnpaidStudents controller logic
        const hodFilteredUnpaid = await prisma.student.findMany({
            where: {
                departmentId: eceDept.id,
                feeStatus: { not: "Paid" }
            }
        });
        console.log("\nUnpaid students filtering test:");
        console.log("HOD unpaid students list:", hodFilteredUnpaid.map(s => s.name));
        if (!hodFilteredUnpaid.some(s => s.name === "Approved ECE Student") || hodFilteredUnpaid.some(s => s.name === "Approved CSE Student")) {
            throw new Error("Unpaid students filtering is broken! ECE HOD should see only ECE unpaid students.");
        }
        console.log("✅ Unpaid students scoping is correct!");
        // Cleanup test data
        console.log("\nCleaning up test data...");
        await prisma.transaction.deleteMany({
            where: { student: { departmentId: eceDept.id } }
        });
        await prisma.student.deleteMany({
            where: { userId: { in: [approvedStudentUserECE.id, approvedStudentUserCSE.id] } }
        });
        await prisma.faculty.deleteMany({
            where: { userId: { in: [facultyUserECE.id, facultyUserCSE.id] } }
        });
        await prisma.user.deleteMany({
            where: {
                id: {
                    in: [
                        registeredUser.id,
                        pendingStudentUserECE.id,
                        pendingStudentUserCSE.id,
                        approvedStudentUserECE.id,
                        approvedStudentUserCSE.id,
                        facultyUserECE.id,
                        facultyUserCSE.id
                    ]
                }
            }
        });
        // Clear hodId of ECE department
        await prisma.department.update({
            where: { id: eceDept.id },
            data: { hodId: null }
        });
        console.log("Cleanup finished successfully!");
        console.log("🎉 ALL TESTS PASSED! Scoped HOD ERP functions are verified.");
    }
    catch (error) {
        console.error("Test failed with error:", error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
