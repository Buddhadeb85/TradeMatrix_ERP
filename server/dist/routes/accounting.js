"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/statements", async (req, res) => {
    try {
        const accounts = await prisma.account.findMany();
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalIncome = 0;
        let totalExpenses = 0;
        const ledgerSummary = { ASSET: [], LIABILITY: [], INCOME: [], EXPENSE: [] };
        accounts.forEach((acc) => {
            const bal = Number(acc.balance);
            ledgerSummary[acc.type].push({ name: acc.name, balance: bal });
            if (acc.type === "ASSET")
                totalAssets += bal;
            if (acc.type === "LIABILITY")
                totalLiabilities += bal;
            if (acc.type === "INCOME")
                totalIncome += bal;
            if (acc.type === "EXPENSE")
                totalExpenses += bal;
        });
        const netProfit = totalIncome - totalExpenses;
        res.json({
            status: "success",
            summary: {
                totalAssets,
                totalLiabilities,
                totalIncome,
                totalExpenses,
                netProfit,
                equity: totalAssets - totalLiabilities
            },
            ledgerSummary
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
