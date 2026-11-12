import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// RECORD PURCHASE INVOICE & SYNCHRONIZE INVENTORY & SUPPLIER DUE
router.post("/purchase", async (req: Request, res: Response) => {
    try {
        const { supplierId, invoiceNumber, paymentType, items } = req.body; 
        // items = [{ productId, quantity, costPrice }]

        if (!supplierId || !items || items.length === 0) {
            return res.status(400).json({ error: "Supplier and purchase items are required." });
        }

        // Calculate total purchase amount
        let totalPurchaseAmount = 0;
        for (const item of items) {
            totalPurchaseAmount += Number(item.quantity) * Number(item.costPrice);
        }

        // Execute inside a Prisma transaction for data integrity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the Purchase record using your exact schema model name 'purchase'
            const purchase = await tx.purchase.create({
                data: {
                    supplierId: Number(supplierId),
                    invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
                    paymentType, // CASH, UPI, CREDIT
                    totalAmount: totalPurchaseAmount,
                    items: {
                        create: items.map((i: any) => ({
                            productId: Number(i.productId),
                            quantity: Number(i.quantity),
                            costPrice: Number(i.costPrice)
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Update Product Stock and Latest Cost Price
            for (const item of items) {
                await tx.product.update({
                    where: { id: Number(item.productId) },
                    data: {
                        currentStock: { increment: Number(item.quantity) },
                        costPrice: Number(item.costPrice)
                    }
                });

                // Optional: Record stock movement log
                await tx.stockMovement.create({
                    data: {
                        productId: Number(item.productId),
                        type: "PURCHASE",
                        quantity: Number(item.quantity),
                        reference: invoiceNumber,
                        note: `Purchase from supplier ID: ${supplierId}`
                    }
                });
            }

            // 3. Update Supplier Accounts Payable (currentDue) if purchased on CREDIT
            if (paymentType === "CREDIT") {
                await tx.supplier.update({
                    where: { id: Number(supplierId) },
                    data: { 
                        currentDue: { increment: totalPurchaseAmount } 
                    }
                });

                // Record supplier transaction log
                await tx.supplierTransaction.create({
                    data: {
                        supplierId: Number(supplierId),
                        amount: totalPurchaseAmount,
                        type: "PURCHASE_CREDIT",
                        reference: invoiceNumber
                    }
                });
            }

            return purchase;
        });

        res.status(201).json({ 
            status: "success", 
            message: "Purchase invoice recorded and inventory updated successfully.", 
            result 
        });
    } catch (error: any) {
        console.error("Purchase error:", error);
        res.status(500).json({ error: error.message || "Failed to process purchase invoice." });
    }
});

export default router;