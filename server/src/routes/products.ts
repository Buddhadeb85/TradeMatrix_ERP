import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET products for the active business
router.get("/", async (req: Request, res: Response) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const search = req.query.search as string || "";
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST create product for the active business
router.post("/", async (req: Request, res: Response) => {
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
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to create product" });
    }
});

export default router;