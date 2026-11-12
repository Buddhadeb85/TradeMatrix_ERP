"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// --- EXPENSES ---
router.get("/expenses", async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: "desc" }
        });
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/expenses", async (req, res) => {
    try {
        const { category, amount, paidTo, notes, date } = req.body;
        if (!category || !amount || !paidTo) {
            return res.status(400).json({ error: "Category, amount, and paidTo are required" });
        }
        const expense = await prisma.expense.create({
            data: {
                category,
                amount: Number(amount),
                paidTo,
                notes,
                date: date ? new Date(date) : new Date()
            }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to record expense" });
    }
});
// --- LIABILITIES & BANK LOANS ---
router.get("/liabilities", async (req, res) => {
    try {
        const liabilities = await prisma.liability.findMany({
            orderBy: { startDate: "desc" }
        });
        res.json(liabilities);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/liabilities", async (req, res) => {
    try {
        const { lenderName, totalAmount, interestRate, monthlyEMI, startDate } = req.body;
        if (!lenderName || !totalAmount || !monthlyEMI) {
            return res.status(400).json({ error: "Lender name, total amount, and monthly EMI are required" });
        }
        const liability = await prisma.liability.create({
            data: {
                lenderName,
                totalAmount: Number(totalAmount),
                outstanding: Number(totalAmount),
                interestRate: interestRate ? Number(interestRate) : 0,
                monthlyEMI: Number(monthlyEMI),
                startDate: startDate ? new Date(startDate) : new Date()
            }
        });
        res.status(201).json(liability);
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to add liability" });
    }
});
// Record EMI Payment / Reduce Liability
router.post("/liabilities/:id/pay-emi", async (req, res) => {
    try {
        const liabilityId = Number(req.params.id);
        const { paymentAmount } = req.body;
        const amt = Number(paymentAmount);
        if (isNaN(amt) || amt <= 0) {
            return res.status(400).json({ error: "Invalid payment amount" });
        }
        const loan = await prisma.liability.findUnique({ where: { id: liabilityId } });
        if (!loan)
            return res.status(404).json({ error: "Loan liability not found" });
        const newOutstanding = Math.max(0, Number(loan.outstanding) - amt);
        const status = newOutstanding === 0 ? "CLOSED" : "ACTIVE";
        const updated = await prisma.liability.update({
            where: { id: liabilityId },
            data: { outstanding: newOutstanding, status }
        });
        res.json({ status: "success", message: "EMI payment recorded", updated });
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to record EMI payment" });
    }
});
exports.default = router;
