import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const router = Router();
const prisma = new PrismaClient();

// GET all login users (Admin only view)
router.get("/", async (req: Request, res: Response) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const users = await prisma.user.findMany({
            where: { businessId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { name: "asc" }
        });
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Create a new login user / staff account
router.post("/create", async (req: Request, res: Response) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: "A user with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                businessId,
                name,
                email,
                passwordHash: hashedPassword,
                role: role || "CASHIER", // ADMIN, MANAGER, CASHIER
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true
            }
        });

        res.status(201).json({ status: "success", user: newUser });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to create user account" });
    }
});

export default router;