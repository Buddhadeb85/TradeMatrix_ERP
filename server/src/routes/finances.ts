import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// --- BALANCE SHEET & GENERAL LEDGER VERIFICATION ---
router.get("/balance-sheet", async (req: Request, res: Response) => {
    try {
        const accounts = await prisma.account.findMany({
            include: {
                lines: true
            }
        });

        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalIncome = 0;
        let totalExpenses = 0;

        const breakdown = accounts.map(acc => {
            const totalDebit = acc.lines.reduce((sum, l) => sum + Number(l.debit), 0);
            const totalCredit = acc.lines.reduce((sum, l) => sum + Number(l.credit), 0);
            
            let balance = 0;
            if (acc.type === "ASSET" || acc.type === "EXPENSE") {
                balance = totalDebit - totalCredit;
                if (acc.type === "ASSET") totalAssets += balance;
                if (acc.type === "EXPENSE") totalExpenses += balance;
            } else {
                balance = totalCredit - totalDebit;
                if (acc.type === "LIABILITY") totalLiabilities += balance;
                if (acc.type === "INCOME") totalIncome += balance;
            }

            return {
                id: acc.id,
                name: acc.name,
                type: acc.type,
                balance: balance
            };
        });

        const netProfit = totalIncome - totalExpenses;
        const equity = totalAssets - totalLiabilities;

        res.json({
            summary: {
                totalAssets,
                totalLiabilities,
                totalIncome,
                totalExpenses,
                netProfit,
                equity
            },
            accounts: breakdown
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Failed to fetch balance sheet verification" });
    }
});

// --- EXPENSES ---
router.get("/expenses", async (req: Request, res: Response) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: "desc" }
        });
        res.json(expenses);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/expenses", async (req: Request, res: Response) => {
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
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to record expense" });
    }
});

// --- LIABILITIES & BANK LOANS ---
router.get("/liabilities", async (req: Request, res: Response) => {
    try {
        const liabilities = await prisma.liability.findMany({
            orderBy: { startDate: "desc" }
        });
        res.json(liabilities);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/liabilities", async (req: Request, res: Response) => {
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
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to add liability" });
    }
});

// Record EMI Payment / Reduce Liability
router.post("/liabilities/:id/pay-emi", async (req: Request, res: Response) => {
    try {
        const liabilityId = Number(req.params.id);
        const { amount } = req.body; // Aligned with frontend payload key
        const amt = Number(amount);

        if (isNaN(amt) || amt <= 0) {
            return res.status(400).json({ error: "Invalid payment amount" });
        }

        const loan = await prisma.liability.findUnique({ where: { id: liabilityId } });
        if (!loan) return res.status(404).json({ error: "Loan liability not found" });

        const newOutstanding = Math.max(0, Number(loan.outstanding) - amt);
        const status = newOutstanding === 0 ? "CLOSED" : "ACTIVE";

        const updated = await prisma.liability.update({
            where: { id: liabilityId },
            data: { outstanding: newOutstanding, status }
        });

        res.json({ status: "success", message: "EMI payment recorded", updated });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to record EMI payment" });
    }
});

export default router;