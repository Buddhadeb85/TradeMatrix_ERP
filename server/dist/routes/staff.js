"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/", async (req, res) => {
    try {
        const staffList = await prisma.staff.findMany({
            include: {
                attendances: { orderBy: { date: "desc" }, take: 1 },
                payrolls: { orderBy: { paymentDate: "desc" }, take: 1 }
            },
            orderBy: { name: "asc" }
        });
        res.json(staffList);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/", async (req, res) => {
    try {
        const { name, phone, role, monthlySalary } = req.body;
        if (!name || !phone || !monthlySalary) {
            return res.status(400).json({ error: "Name, phone, and monthly salary are required" });
        }
        const staff = await prisma.staff.create({
            data: {
                name,
                phone,
                role: role || "CASHIER",
                monthlySalary: Number(monthlySalary)
            }
        });
        res.status(201).json(staff);
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to create staff" });
    }
});
exports.default = router;
