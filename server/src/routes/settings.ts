import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET shop settings for active business
router.get("/", async (req: Request, res: Response) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        
        let settings = await prisma.shopSetting.findUnique({
            where: { businessId }
        });
        
        if (!settings) {
            settings = await prisma.shopSetting.create({
                data: {
                    businessId,
                    shopName: "My Grocery Shop",
                    tagline: "Fresh & Quality Essentials",
                    receiptFooter: "Thank you for shopping with us!"
                }
            });
        }
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update shop settings for active business (including logoUrl)
router.put("/", async (req: Request, res: Response) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { shopName, tagline, phone, address, gstin, logoUrl, receiptFooter } = req.body;
        
        const settings = await prisma.shopSetting.upsert({
            where: { businessId },
            update: {
                shopName,
                tagline,
                phone,
                address,
                gstin,
                logoUrl,
                receiptFooter
            },
            create: {
                businessId,
                shopName: shopName || "My Grocery Shop",
                tagline: tagline || "Fresh & Quality Essentials",
                phone,
                address,
                gstin,
                logoUrl,
                receiptFooter: receiptFooter || "Thank you for shopping with us!"
            }
        });

        res.json({ status: "success", settings });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;