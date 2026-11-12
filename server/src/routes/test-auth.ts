import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testAuth() {
  const testCases = [
    { email: 'admin@grocerypos.com', pass: 'admin123' },
    { email: 'cashier@tradematrix.com', pass: 'securePassword123' },
  ];

  for (const tc of testCases) {
    const user = await prisma.user.findUnique({ where: { email: tc.email } });
    if (!user) {
      console.log(`❌ User not found: ${tc.email}`);
      continue;
    }

    const match = await bcrypt.compare(tc.pass, user.passwordHash);
    if (match) {
      console.log(`✅ SUCCESS: Authentication passed for ${tc.email} (Role: ${user.role})`);
    } else {
      console.log(`❌ FAILURE: Password mismatch for ${tc.email}`);
    }
  }
}

testAuth()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());