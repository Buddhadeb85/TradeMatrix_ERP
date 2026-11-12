import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
  // 1. Ensure a default business exists to satisfy foreign key constraints
  let business = await prisma.business.findFirst();
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'TradeMatrix Default Store',
      },
    });
  }

  const email = 'cashier@tradematrix.com';
  const plainPassword = 'securePassword123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 2. Create or update the user with your schema's required passwordHash field
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      name: 'Store Cashier',
      role: 'CASHIER',
    },
    create: {
      email,
      passwordHash: hashedPassword,
      name: 'Store Cashier',
      role: 'CASHIER',
      businessId: business.id,
    },
  });

  console.log('User account successfully created/updated:', user.email);
}

createUser()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());