"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET shop settings for active business
router.get("/", async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT update shop settings for active business (including logoUrl)
router.put("/", async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
