import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet"; // <--- Security headers
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// Import Routers
import authRouter from "./routes/auth";
import businessRouter from "./routes/businesses";
import inventoryRouter from "./routes/inventory";
import posRouter from "./routes/pos";
import reportsRouter from "./routes/reports";
import settingsRouter from "./routes/settings";
import customerRouter from "./routes/customers";
import financesRouter from "./routes/finances";
import supplierRouter from "./routes/suppliers";
import staffRouter from "./routes/staff";
import accountingRouter from "./routes/accounting";
import productRouter from "./routes/products";
import billRouter from "./routes/bills";
import userRouter from "./routes/users";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware & Security Firewalls
app.use(helmet());
app.use(cors({ 
    origin: [
        "http://localhost:5173", 
        "http://localhost:3000", 
        "tauri://localhost", 
        "http://tauri.localhost"
    ], 
    credentials: true 
}));

// CRITICAL FIX: Increased payload limit to 10MB to support base64 logos and bulk inventories
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Health Check Endpoint
app.get("/api/health", async (req: Request, res: Response) => {
    try {
        const categoryCount = await prisma.category.count();
        res.status(200).json({ status: "success", message: "API connected to MySQL!", categoryCount });
    } catch (error: any) {
        res.status(500).json({ status: "error", error: error.message });
    }
});

// Mount API Routes
app.use("/api/auth", authRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/pos", posRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/customers", customerRouter);
app.use("/api/finances", financesRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/staff", staffRouter);
app.use("/api/accounting", accountingRouter);
app.use("/api/products", productRouter);
app.use("/api/bills", billRouter);
app.use("/api/businesses", businessRouter);
app.use("/api/users", userRouter);

// Start Server
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`TradeMatrix Server running on http://localhost:${PORT}`);
});