import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET all businesses
router.get("/", async (req: Request, res: Response) => {
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
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST create a new business
router.post("/", async (req: Request, res: Response) => {
    try {
        const { name, phone, address, gstin } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Business name is required" });
        }

        const newBusiness = await prisma.business.create({
            data: { name, phone, address, gstin }
        });

        res.status(201).json(newBusiness);
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to create business" });
    }
});

export default router;
