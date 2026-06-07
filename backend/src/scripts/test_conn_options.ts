import { PrismaClient } from '@prisma/client';

const urls = [
  'mysql://root@localhost:3306/studentdb',
  'mysql://root:root@localhost:3306/studentdb',
  'mysql://root:password@localhost:3306/studentdb',
  'mysql://root:admin@localhost:3306/studentdb',
  'mysql://root:root123@localhost:3306/studentdb',
  'mysql://root:123456@localhost:3306/studentdb',
  'mysql://root:12345678@localhost:3306/studentdb',
  'mysql://root:mysql@localhost:3306/studentdb'
];

async function testConnection(url: string): Promise<boolean> {
  process.env.DATABASE_URL = url;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    await prisma.$connect();
    console.log(`Success with URL: ${url}`);
    return true;
  } catch (error: any) {
    console.log(`Failed with URL: ${url} (Error: ${error.message.substring(0, 100)})`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  for (const url of urls) {
    const success = await testConnection(url);
    if (success) {
      console.log(`\nFound working URL: ${url}`);
      break;
    }
  }
}

main();
