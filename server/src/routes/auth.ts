import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secure_secret_key";

// REGISTER initial user/admin
router.post("/register", async (req: Request, res: Response) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { name, email, password, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                businessId,
                name,
                email,
                passwordHash: hashedPassword,
                role: role || "ADMIN"
            }
        });

        res.status(201).json({ status: "success", userId: newUser.id, email: newUser.email });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Email already registered" });
        }
        res.status(500).json({ error: error.message });
    }
});

// LOGIN ROUTE
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Since email is globally unique, find unique user directly
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !user.isActive) {
            return res.status(401).json({ error: "Invalid credentials or inactive account" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, businessId: user.businessId, role: user.role },
            JWT_SECRET,
            { expiresIn: "12h" }
        );

        res.json({
            status: "success",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, businessId: user.businessId }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// FORGOT / RESET PASSWORD ROUTE
router.post("/forgot-password", async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ error: "Email and new password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User email not found in the system" });
        }

        // Hash the new password securely
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password in database
        await prisma.user.update({
            where: { email },
            data: { passwordHash: hashedPassword }
        });

        res.json({ status: "success", message: "Password updated successfully! You can now log in." });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to reset password" });
    }
});

export default router;