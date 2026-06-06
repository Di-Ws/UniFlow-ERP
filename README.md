Deployed https://github.com/Di-Ws/UniFlow-ERP.git

Multi-Branch University Management System

UniFlow is a scalable, department-centric ERP designed to streamline academic administration. Unlike traditional flat ERPs, UniFlow utilizes a localized administration model where the Head of Department (HOD) acts as the Super Admin for their specific branch, ensuring data isolation and high-integrity reporting.

🚀 Key Features
🏛️ Departmental Autonomy (Multi-Tenant)
Role-Based Access Control (RBAC): Distinct dashboards and permissions for HODs, Faculty, and Students.

Data Isolation: Ensures that a CSE HOD can only manage CSE records, maintaining cross-departmental privacy.

🛡️ System Integrity & Security
User Approval Workflow: New registrations are set to PENDING by default, requiring HOD verification before portal access.

Virtual Classroom Gatekeeper: Middleware that validates a student's BatchID before allowing entry into secure meeting links.

JWT & HttpOnly Security: State-of-the-most-secure authentication flow to prevent XSS and CSRF attacks.

📊 Academic & Resource Management
Smart Attendance Engine: Real-time calculation logic (e.g., 5/8 lectures attended translates to a 0.5/Half-Day status).

Faculty-Syllabus Mapping: Dynamic assignment of instructors to subjects, with automatic propagation to student portals.

Strategic Summaries: High-level analytics for HODs to monitor curriculum readiness and prerequisite mapping.

🛠️ Tech Stack
Frontend: React, TypeScript, Tailwind CSS

Backend: Node.js, Express.js

Database: MySQL

ORM: Prisma

Authentication: JWT, HttpOnly Cookies

🏗️ Database Architecture
UniFlow leverages Prisma ORM for type-safe database interactions. The schema is designed for relational integrity:

Code snippet
// Core logic snippet
model Department {
  id        String    @id @default(uuid())
  name      String    @unique
  subjects  Subject[]
  users     User[]
}

model User {
  id        String     @id @default(uuid())
  role      Role       @default(STUDENT)
  status    UserStatus @default(PENDING)
  dept      Department @relation(fields: [deptId], references: [id])
  // ...
}
🚦 Getting Started
1. Prerequisites
Node.js (v16+)

MySQL Instance

2. Installation
Bash
# Clone the repository
git clone https://github.com/your-username/uniflow-erp.git

# Install dependencies
npm install

# Setup Environment Variables
# Create a .env file and add your DATABASE_URL and JWT_SECRET
3. Database Migration
Bash
npx prisma migrate dev --name init
npx prisma db seed
4. Run the Application
Bash
# Start Backend
npm run dev:server

# Start Frontend
npm run dev:client
📸 Dashboard Preview
(Reference: See image_b04961.png for the HOD Strategic Summary and image_a63e16.png for the System Integrity Module in the assets folder.)

📝 License
Distributed under the MIT License. See LICENSE for more information.
