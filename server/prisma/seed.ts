import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // 1. Create Default Business
    const business = await prisma.business.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: "My Grocery Shop",
            phone: "9876543210",
            address: "Main Market, Howrah"
        }
    });

    // 2. Create Default Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@grocerypos.com" },
        update: {},
        create: {
            businessId: business.id,
            name: "Shop Admin",
            email: "admin@grocerypos.com",
            passwordHash: hashedPassword,
            role: "ADMIN"
        }
    });

    // 3. Create Default Shop Settings
    await prisma.shopSetting.upsert({
        where: { businessId: business.id },
        update: {},
        create: {
            businessId: business.id,
            shopName: "My Grocery Shop",
            tagline: "Fresh & Quality Essentials",
            receiptFooter: "Thank you for shopping with us!"
        }
    });

    console.log("Seeding completed successfully!");
    console.log("Default Admin Login: admin@grocerypos.com / admin123");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
