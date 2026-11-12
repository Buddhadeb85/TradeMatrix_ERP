"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const accounting_1 = require("../services/accounting");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post("/checkout", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { items, paymentMethod, customerId, reference, walkinName, walkinPhone } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }
        const validPaymentMethod = paymentMethod || "CASH";
        // Validation: Transaction ID required for UPI & CARD
        if ((validPaymentMethod === "UPI" || validPaymentMethod === "CARD") && (!reference || !reference.trim())) {
            return res.status(400).json({ error: `Transaction ID / Reference No. is mandatory for ${validPaymentMethod} payments.` });
        }
        const billNumber = "BILL-" + Date.now();
        const billReference = reference || (validPaymentMethod === "CREDIT" ? "CREDIT_SALE" : "CASH_SALE");
        const result = await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const processedItems = [];
            for (const cartItem of items) {
                // Ensure product belongs to the active business context
                const product = await tx.product.findFirst({
                    where: { id: Number(cartItem.productId), businessId },
                    include: { stockMovements: true }
                });
                if (!product || !product.isActive) {
                    throw new Error(`Product ID ${cartItem.productId} not found or inactive under this business`);
                }
                const currentStock = product.stockMovements.reduce((acc, m) => {
                    const qty = Number(m.quantity);
                    if (m.type === "OPENING" || m.type === "RECEIVED" || m.type === "ADJUSTMENT")
                        return acc + qty;
                    if (m.type === "REMOVED" || m.type === "SALE")
                        return acc - qty;
                    return acc;
                }, 0);
                const requestedQty = Number(cartItem.quantity);
                if (currentStock < requestedQty) {
                    throw new Error(`Insufficient stock for "${product.name}". Available: ${currentStock}`);
                }
                const sellingPrice = Number(product.sellingPrice);
                totalAmount += sellingPrice * requestedQty;
                processedItems.push({
                    productId: product.id,
                    quantity: requestedQty,
                    price: sellingPrice
                });
            }
            let resolvedCustomerId = customerId ? Number(customerId) : null;
            // If walk-in customer provided optional name/phone, auto-register or attach customer
            if (!resolvedCustomerId && walkinName && walkinPhone) {
                let existingCust = await tx.customer.findUnique({ where: { phone: walkinPhone } });
                if (!existingCust) {
                    existingCust = await tx.customer.create({
                        data: { name: walkinName, phone: walkinPhone, creditLimit: 10000 }
                    });
                }
                resolvedCustomerId = existingCust.id;
            }
            if (validPaymentMethod === "CREDIT") {
                if (!resolvedCustomerId)
                    throw new Error("Customer must be selected for Credit (Udhar) sales");
                const customer = await tx.customer.findUnique({ where: { id: resolvedCustomerId } });
                if (!customer)
                    throw new Error("Customer not found");
                await tx.customer.update({
                    where: { id: resolvedCustomerId },
                    data: { currentDue: { increment: totalAmount } }
                });
                await tx.customerTransaction.create({
                    data: {
                        customerId: resolvedCustomerId,
                        amount: totalAmount,
                        type: "SALE",
                        reference: billNumber
                    }
                });
                await (0, accounting_1.postJournalEntry)(tx, billNumber, `Credit Sale to Customer #${resolvedCustomerId}`, [
                    { accountName: "Accounts Receivable", debit: totalAmount, credit: 0 },
                    { accountName: "Sales Revenue", debit: 0, credit: totalAmount }
                ]);
            }
            else {
                await (0, accounting_1.postJournalEntry)(tx, billNumber, `${validPaymentMethod} POS Sale [Ref: ${billReference}]`, [
                    { accountName: "Cash-in-Hand / Bank", debit: totalAmount, credit: 0 },
                    { accountName: "Sales Revenue", debit: 0, credit: totalAmount }
                ]);
            }
            // Create Bill associated with the active business
            const bill = await tx.bill.create({
                data: {
                    businessId, // <--- Multi-business segregation link
                    billNumber,
                    totalAmount,
                    paymentMethod: validPaymentMethod,
                    customerId: resolvedCustomerId,
                    items: { create: processedItems }
                },
                include: { items: true, customer: true }
            });
            // Record stock movements (decrementing inventory safely via stock movements table)
            for (const item of processedItems) {
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: "SALE",
                        quantity: item.quantity,
                        reference: billReference,
                        note: `Sold via POS Bill #${billNumber}`
                    }
                });
            }
            return bill;
        });
        res.status(201).json({ status: "success", message: "Checkout successful", bill: result });
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Checkout failed" });
    }
});
router.get("/bills", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        // Filter bills strictly by active business ID
        const bills = await prisma.bill.findMany({
            where: { businessId },
            include: { items: { include: { product: true } }, customer: true },
            orderBy: { createdAt: "desc" },
            take: 50
        });
        res.json(bills);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
