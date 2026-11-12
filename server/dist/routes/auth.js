"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secure_secret_key";
// REGISTER initial user/admin
router.post("/register", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { name, email, password, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
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
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Email already registered" });
        }
        res.status(500).json({ error: error.message });
    }
});
// LOGIN ROUTE
router.post("/login", async (req, res) => {
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
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, businessId: user.businessId, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
        res.json({
            status: "success",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, businessId: user.businessId }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
