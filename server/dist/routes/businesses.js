"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET all businesses
router.get("/", async (req, res) => {
    try {
        let businesses = await prisma.business.findMany({
            orderBy: { name: "asc" }
        });
        // If no business exists yet, automatically create a default one
        if (businesses.length === 0) {
            const defaultBiz = await prisma.business.create({
                data: {
                    name: "My Primary Business",
                    phone: "",
                    address: "",
                    gstin: ""
                }
            });
            businesses = [defaultBiz];
        }
        res.json(businesses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST create a new business
router.post("/", async (req, res) => {
    try {
        const { name, phone, address, gstin } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Business name is required" });
        }
        const newBusiness = await prisma.business.create({
            data: { name, phone, address, gstin }
        });
        res.status(201).json(newBusiness);
    }
    catch (error) {
        res.status(400).json({ error: error.message || "Failed to create business" });
    }
});
exports.default = router;
