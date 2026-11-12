"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// ==================== CATEGORIES ====================
// GET: List all categories (Global or Business-agnostic, keeping general categories accessible)
router.get("/categories", async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" }
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST: Create a category
router.post("/categories", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Category name is required" });
        }
        const category = await prisma.category.create({
            data: { name: name.trim() }
        });
        res.status(201).json(category);
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Category name already exists" });
        }
        res.status(500).json({ error: error.message });
    }
});
// ==================== PRODUCTS ====================
// GET: List and search products with filters, segregated by active business ID
router.get("/products", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { search, categoryId, lowStock } = req.query;
        let whereClause = { businessId, isActive: true };
        if (search) {
            whereClause.OR = [
                { name: { contains: String(search) } },
                { sku: { contains: String(search) } },
                { barcode: { contains: String(search) } }
            ];
        }
        if (categoryId) {
            whereClause.categoryId = Number(categoryId);
        }
        const products = await prisma.product.findMany({
            where: whereClause,
            include: { category: true, stockMovements: true },
            orderBy: { name: "asc" }
        });
        // Calculate current stock dynamically from movements
        const formattedProducts = products.map(product => {
            const currentStock = product.stockMovements.reduce((acc, m) => {
                const qty = Number(m.quantity);
                if (m.type === "OPENING" || m.type === "RECEIVED" || m.type === "ADJUSTMENT") {
                    return acc + qty;
                }
                else if (m.type === "REMOVED" || m.type === "SALE") {
                    return acc - qty;
                }
                return acc;
            }, 0);
            return {
                ...product,
                currentStock,
                isLowStock: currentStock <= Number(product.lowStockLevel)
            };
        });
        // Filter low stock if requested
        let finalProducts = formattedProducts;
        if (lowStock === "true") {
            finalProducts = formattedProducts.filter(p => p.isLowStock);
        }
        res.json(finalProducts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST: Register a new product with opening stock under the active business
router.post("/products", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { name, sku, barcode, categoryId, unit, costPrice, sellingPrice, lowStockLevel, openingStock } = req.body;
        if (!name || !categoryId || !unit || costPrice === undefined || sellingPrice === undefined) {
            return res.status(400).json({ error: "Missing required product fields" });
        }
        // Transaction to create product + record opening stock movement
        const result = await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    businessId, // <--- Multi-business segregation field
                    name,
                    sku: sku || null,
                    barcode: barcode || null,
                    categoryId: Number(categoryId),
                    unit,
                    costPrice: Number(costPrice),
                    sellingPrice: Number(sellingPrice),
                    lowStockLevel: lowStockLevel !== undefined ? Number(lowStockLevel) : 5.0
                }
            });
            const initStock = openingStock ? Number(openingStock) : 0;
            if (initStock > 0) {
                await tx.stockMovement.create({
                    data: {
                        productId: product.id,
                        type: "OPENING",
                        quantity: initStock,
                        note: "Opening stock registration"
                    }
                });
            }
            return product;
        });
        res.status(201).json(result);
    }
    catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "SKU or Barcode must be unique" });
        }
        res.status(500).json({ error: error.message });
    }
});
// POST: Record stock adjustment (Received / Removed) ensuring product belongs to active business
router.post("/products/:id/stock-adjustments", async (req, res) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const productId = Number(req.params.id);
        const { type, quantity, note } = req.body;
        if (!["RECEIVED", "REMOVED", "ADJUSTMENT"].includes(type) || !quantity || Number(quantity) <= 0) {
            return res.status(400).json({ error: "Invalid adjustment type or quantity" });
        }
        // Verify product belongs to the active business context
        const product = await prisma.product.findFirst({
            where: { id: productId, businessId }
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found under the active business" });
        }
        const movement = await prisma.stockMovement.create({
            data: {
                productId,
                type,
                quantity: Number(quantity),
                note: note || "Manual stock adjustment"
            }
        });
        res.status(201).json(movement);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
