import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function registerNewUser() {
  // 1. Ensure a default business exists for the foreign key relation
  let business = await prisma.business.findFirst();
  if (!business) {
    business = await prisma.business.create({
      data: { name: 'TradeMatrix Default Store' },
    });
  }

  const name = 'New Manager';
  const email = 'manager@tradematrix.com';
  const plainPassword = 'managerPassword123';
  const role = 'MANAGER'; // Options: ADMIN, MANAGER, CASHIER

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role,
      businessId: business.id,
      isActive: true,
    },
  });

  console.log('✅ New user successfully registered:', newUser.email);
}

registerNewUser()
  .catch((e) => console.error('❌ Error registering user:', e))
  .finally(async () => await prisma.$disconnect());