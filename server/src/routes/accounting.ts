import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/statements", async (req: Request, res: Response) => {
    try {
        const accounts = await (prisma as any).account.findMany();

        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalIncome = 0;
        let totalExpenses = 0;

        const ledgerSummary: any = { ASSET: [], LIABILITY: [], INCOME: [], EXPENSE: [] };

        accounts.forEach((acc: any) => {
            const bal = Number(acc.balance);
            ledgerSummary[acc.type].push({ name: acc.name, balance: bal });

            if (acc.type === "ASSET") totalAssets += bal;
            if (acc.type === "LIABILITY") totalLiabilities += bal;
            if (acc.type === "INCOME") totalIncome += bal;
            if (acc.type === "EXPENSE") totalExpenses += bal;
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
