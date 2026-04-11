import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 0. Create Admin User
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@university.edu',
      password: adminPassword,
    },
  });

  // 1. Create Sample Students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { email: 'john@university.edu' },
      update: {},
      create: {
        name: 'John Smith',
        email: 'john@university.edu',
        phone: '123-456-7890',
        address: '123 University Ave',
        branch: 'Computer Science',
        section: 'A',
        semester: 4,
        attendance: 85.5,
        feeStatus: 'Paid',
      },
    }),
    prisma.student.upsert({
      where: { email: 'sarah@university.edu' },
      update: {},
      create: {
        name: 'Sarah Johnson',
        email: 'sarah@university.edu',
        phone: '098-765-4321',
        address: '456 College Blvd',
        branch: 'Electronics',
        section: 'B',
        semester: 6,
        attendance: 92.0,
        feeStatus: 'Unpaid',
      },
    }),
  ]);

  console.log('Students created:', students.length);

  // 2. Create Sample Teachers
  const teachers = await Promise.all([
    prisma.teacher.create({
      data: {
        name: 'Dr. Alan Turing',
        subject: 'Algorithms',
        phone: '555-0101',
        address: 'Mathematics Dept',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
    }),
    prisma.teacher.create({
      data: {
        name: 'Dr. Ada Lovelace',
        subject: 'Programming',
        phone: '555-0202',
        address: 'Computer Science Dept',
        photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      },
    }),
  ]);

  console.log('Teachers created:', teachers.length);

  // 3. Create Sample Events
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Annual Tech Symposium',
        description: 'A day of innovation and showcases.',
        eventDate: tomorrow,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Mid-Semester Break',
        description: 'University closed for one week.',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('Events created:', events.length);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
