"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET products for the active business
router.get("/", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const search = req.query.search || "";
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
        const products = await prisma.product.findMany({
            where: {
                businessId,
                categoryId: categoryId ? categoryId : undefined,
                OR: search ? [
                    { name: { contains: search } },
                    { barcode: { contains: search } },
                    { sku: { contains: search } }
                ] : undefined
            },
            include: { category: true },
            orderBy: { name: "asc" }
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST create product for the active business
router.post("/", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { name, sku, barcode, categoryId, unit, costPrice, sellingPrice, gstRate, lowStockLevel } = req.body;
        const newProduct = await prisma.product.create({
            data: {
                businessId,
                name,
                sku: sku || null,
                barcode: barcode || null,
                categoryId: Number(categoryId),
                unit: unit || "pcs",
                costPrice: Number(costPrice),
                sellingPrice: Number(sellingPrice),
                gstRate: Number(gstRate || 5),
                lowStockLevel: Number(lowStockLevel || 5)
            }
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to create product" });
    }
});
exports.default = router;
