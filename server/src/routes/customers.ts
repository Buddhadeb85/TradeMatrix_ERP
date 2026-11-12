import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { postJournalEntry } from "../services/accounting";

const router = Router();
const prisma = new PrismaClient();

// GET: Fetch all customers with transactions and bills
router.get("/", async (req: Request, res: Response) => {
    try {
        const customers = await prisma.customer.findMany({
            include: { transactions: true, bills: true },
            orderBy: { name: "asc" }
        });
        res.json(customers);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST: Register a new customer
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, phone, address, creditLimit } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ error: "Customer name and phone are required" });
        }
        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                address,
                creditLimit: creditLimit ? Number(creditLimit) : 10000
            }
        });
        res.status(201).json(customer);
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to create customer" });
    }
});

// POST: Settle customer due (Udhar Payment)
router.post("/:id/payment", async (req: Request, res: Response) => {
    try {
        const customerId = Number(req.params.id);
        const { amount, paymentMethod, reference } = req.body;
        const payAmount = Number(amount);

        if (isNaN(payAmount) || payAmount <= 0) {
            return res.status(400).json({ error: "Invalid settlement amount" });
        }

        const result = await prisma.$transaction(async (tx) => {
            const customer = await tx.customer.findUnique({ where: { id: customerId } });
            if (!customer) throw new Error("Customer not found");

            // Decrement customer due balance
            const updatedCustomer = await tx.customer.update({
                where: { id: customerId },
                data: { currentDue: { decrement: payAmount } }
            });

            // Log customer transaction
            const transaction = await tx.customerTransaction.create({
                data: {
                    customerId,
                    amount: payAmount,
                    type: "PAYMENT_RECEIVED",
                    reference: reference || "DUE_SETTLEMENT"
                }
            });

            // AUTOMATIC JOURNAL ENTRY: Debit Cash/Bank, Credit Accounts Receivable
            await postJournalEntry(tx, reference || "CUST-SETTLE", `Due settlement received from Customer #${customerId}`, [
                { accountName: "Cash-in-Hand / Bank", debit: payAmount, credit: 0 },
                { accountName: "Accounts Receivable", debit: 0, credit: payAmount }
            ]);

            return { updatedCustomer, transaction };
        });

        res.json({ status: "success", message: "Due settlement recorded successfully", ...result });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to record customer payment" });
    }
});

export default router;
