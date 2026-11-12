import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Ensure a default business exists to satisfy the required businessId foreign key
  let business = await prisma.business.findFirst();
  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'TradeMatrix Default Store',
      },
    });
  }

  const hashedPassword = await bcrypt.hash('admin123', 10); 
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@grocerypos.com' },
    update: { 
      passwordHash: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@grocerypos.com',
      passwordHash: hashedPassword, // Fixed from 'password' to 'passwordHash'
      name: 'Admin',
      role: 'ADMIN',
      businessId: business.id, // Provided required business relation
    },
  });
  
  console.log('Admin user successfully configured:', user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());