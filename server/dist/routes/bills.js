"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET bills for the active business
router.get("/", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const bills = await prisma.bill.findMany({
            where: { businessId },
            include: { customer: true, items: { include: { product: true } } },
            orderBy: { createdAt: "desc" }
        });
        res.json(bills);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST checkout cart & create bill for the active business
router.post("/checkout", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { items, paymentMethod, customerId } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }
        const billNumber = `BILL-${Date.now().toString().slice(-6)}`;
        let totalAmount = 0;
        let taxAmount = 0;
        const result = await prisma.$transaction(async (tx) => {
            const formattedItems = [];
            for (const item of items) {
                const product = await tx.product.findFirst({
                    where: { id: Number(item.productId), businessId }
                });
                if (!product) {
                    throw new Error(`Product ID ${item.productId} not found under active business`);
                }
                const lineTotal = Number(product.sellingPrice) * item.quantity;
                totalAmount += lineTotal;
                formattedItems.push({
                    productId: product.id,
                    quantity: Number(item.quantity),
                    price: product.sellingPrice
                });
            }
            const newBill = await tx.bill.create({
                data: {
                    businessId,
                    billNumber,
                    customerId: customerId ? Number(customerId) : null,
                    totalAmount,
                    taxAmount,
                    paymentMethod: paymentMethod || "CASH",
                    items: {
                        create: formattedItems
                    }
                },
                include: { items: { include: { product: true } }, customer: true }
            });
            // Record stock movements for each item sold to decrement stock dynamically
            for (const item of formattedItems) {
                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        type: "SALE",
                        quantity: item.quantity,
                        reference: billNumber,
                        note: `Sold via Bill #${billNumber}`
                    }
                });
            }
            return newBill;
        });
        res.status(201).json({ status: "success", bill: result });
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Checkout failed" });
    }
});
exports.default = router;
