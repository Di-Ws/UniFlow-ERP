import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 0. Create Departments
  const csDept = await prisma.department.upsert({
    where: { name: 'Computer Science' },
    update: {},
    create: { name: 'Computer Science' }
  });

  const ecDept = await prisma.department.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' }
  });

  // 1. Create Admin User (HOD of CS)
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: { role: Role.HOD },
    create: {
      name: 'System Admin',
      email: 'admin@university.edu',
      password: adminPassword,
      role: Role.HOD
    },
  });

  // Link Admin to CS Dept as HOD
  await prisma.department.update({
    where: { id: csDept.id },
    data: { hodId: admin.id }
  });

  // 2. Create Faculty Users and Profiles
  const facultyPassword = await bcrypt.hash('Faculty@123', 10);
  
  const faculty1User = await prisma.user.upsert({
    where: { email: 'alan@university.edu' },
    update: { role: Role.FACULTY },
    create: {
      name: 'Dr. Alan Turing',
      email: 'alan@university.edu',
      password: facultyPassword,
      role: Role.FACULTY
    }
  });

  const faculty1 = await prisma.faculty.upsert({
    where: { email: 'alan@university.edu' },
    update: {},
    create: {
      userId: faculty1User.id,
      name: 'Dr. Alan Turing',
      email: 'alan@university.edu',
      phone: '555-0101',
      address: 'Mathematics Dept',
      departmentId: csDept.id,
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    }
  });

  const faculty2User = await prisma.user.upsert({
    where: { email: 'ada@university.edu' },
    update: { role: Role.FACULTY },
    create: {
      name: 'Dr. Ada Lovelace',
      email: 'ada@university.edu',
      password: facultyPassword,
      role: Role.FACULTY
    }
  });

  const faculty2 = await prisma.faculty.upsert({
    where: { email: 'ada@university.edu' },
    update: {},
    create: {
      userId: faculty2User.id,
      name: 'Dr. Ada Lovelace',
      email: 'ada@university.edu',
      phone: '555-0202',
      address: 'Computer Science Dept',
      departmentId: csDept.id,
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    }
  });

  // 3. Create Courses
  const algoCourse = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      name: 'Algorithms',
      code: 'CS101',
      departmentId: csDept.id,
      faculty: { connect: { id: faculty1.id } }
    }
  });

  const progCourse = await prisma.course.upsert({
    where: { code: 'CS102' },
    update: {},
    create: {
      name: 'Programming',
      code: 'CS102',
      departmentId: csDept.id,
      faculty: { connect: { id: faculty2.id } }
    }
  });

  // 4. Create Students
  const studentPassword = await bcrypt.hash('Student@123', 10);
  
  const student1User = await prisma.user.upsert({
    where: { email: 'john@university.edu' },
    update: { role: Role.STUDENT },
    create: {
      name: 'John Smith',
      email: 'john@university.edu',
      password: studentPassword,
      role: Role.STUDENT
    }
  });

  await prisma.student.upsert({
    where: { email: 'john@university.edu' },
    update: {},
    create: {
      userId: student1User.id,
      name: 'John Smith',
      email: 'john@university.edu',
      phone: '123-456-7890',
      address: '123 University Ave',
      departmentId: csDept.id,
      batch: '2022-2026',
      year: 2,
      semester: 4,
      faculty: { connect: { id: faculty1.id } },
      courses: { connect: [{ id: algoCourse.id }, { id: progCourse.id }] }
    },
  });

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
