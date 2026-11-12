"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const accounting_1 = require("../services/accounting");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/", async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            include: { purchases: true, transactions: true },
            orderBy: { name: "asc" }
        });
        res.json(suppliers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post("/", async (req, res) => {
    try {
        const { name, phone, companyName } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ error: "Supplier name and phone are required" });
        }
        const supplier = await prisma.supplier.create({
            data: { name, phone, companyName }
        });
        res.status(201).json(supplier);
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to create supplier" });
    }
});
router.post("/purchase", async (req, res) => {
    try {
        const { supplierId, invoiceNumber, paymentType, items } = req.body;
        if (!supplierId || !invoiceNumber || !items || items.length === 0) {
            return res.status(400).json({ error: "Supplier, invoice number, and items are required" });
        }
        const result = await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const processedItems = [];
            for (const i of items) {
                const product = await tx.product.findUnique({ where: { id: Number(i.productId) } });
                if (!product)
                    throw new Error(`Product ID ${i.productId} not found`);
                const lineTotal = Number(i.quantity) * Number(i.costPrice);
                totalAmount += lineTotal;
                processedItems.push({
                    productId: product.id,
                    quantity: Number(i.quantity),
                    costPrice: Number(i.costPrice)
                });
            }
            if (paymentType === "CREDIT") {
                await tx.supplier.update({
                    where: { id: Number(supplierId) },
                    data: { currentDue: { increment: totalAmount } }
                });
                await tx.supplierTransaction.create({
                    data: {
                        supplierId: Number(supplierId),
                        amount: totalAmount,
                        type: "PURCHASE_CREDIT",
                        reference: `Inv: ${invoiceNumber}`
                    }
                });
                // AUTOMATIC JOURNAL: Debit Inventory Asset, Credit Accounts Payable
                await (0, accounting_1.postJournalEntry)(tx, `PO-${invoiceNumber}`, `Credit Purchase from Supplier #${supplierId}`, [
                    { accountName: "Inventory Asset", debit: totalAmount, credit: 0 },
                    { accountName: "Accounts Payable", debit: 0, credit: totalAmount }
                ]);
            }
            else {
                // AUTOMATIC JOURNAL: Debit Inventory Asset, Credit Cash/Bank
                await (0, accounting_1.postJournalEntry)(tx, `PO-${invoiceNumber}`, `Cash/UPI Purchase from Supplier #${supplierId}`, [
                    { accountName: "Inventory Asset", debit: totalAmount, credit: 0 },
                    { accountName: "Cash-in-Hand / Bank", debit: 0, credit: totalAmount }
                ]);
            }
            const purchase = await tx.purchase.create({
                data: {
                    invoiceNumber,
                    supplierId: Number(supplierId),
                    totalAmount,
                    paymentType,
                    items: { create: processedItems }
                },
                include: { items: true, supplier: true }
            });
            for (const item of processedItems) {
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: "RECEIVED",
                        quantity: item.quantity,
                        reference: `PO-${invoiceNumber}`,
                        note: `Stock received via Purchase Invoice #${invoiceNumber}`
                    }
                });
            }
            return purchase;
        });
        res.status(201).json({ status: "success", message: "Purchase recorded and stock updated", result });
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to record purchase" });
    }
});
router.post("/:id/payment", async (req, res) => {
    try {
        const supplierId = Number(req.params.id);
        const { amount, reference } = req.body;
        const payAmount = Number(amount);
        if (isNaN(payAmount) || payAmount <= 0) {
            return res.status(400).json({ error: "Invalid settlement amount" });
        }
        const result = await prisma.$transaction(async (tx) => {
            const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
            if (!supplier)
                throw new Error("Supplier not found");
            const updatedSupplier = await tx.supplier.update({
                where: { id: supplierId },
                data: { currentDue: { decrement: payAmount } }
            });
            const transaction = await tx.supplierTransaction.create({
                data: {
                    supplierId,
                    amount: payAmount,
                    type: "PAYMENT_PAID",
                    reference: reference || "BILL_SETTLEMENT"
                }
            });
            // AUTOMATIC JOURNAL: Debit Accounts Payable, Credit Cash/Bank
            await (0, accounting_1.postJournalEntry)(tx, reference || "SUPPLIER-PAY", `Settled Payable for Supplier #${supplierId}`, [
                { accountName: "Accounts Payable", debit: payAmount, credit: 0 },
                { accountName: "Cash-in-Hand / Bank", debit: 0, credit: payAmount }
            ]);
            return { updatedSupplier, transaction };
        });
        res.json({ status: "success", message: "Supplier payment recorded successfully", ...result });
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to record payment" });
    }
});
exports.default = router;
