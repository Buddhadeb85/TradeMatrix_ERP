"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet")); // <--- Security headers
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
// Import Routers
const auth_1 = __importDefault(require("./routes/auth"));
const businesses_1 = __importDefault(require("./routes/businesses"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const pos_1 = __importDefault(require("./routes/pos"));
const reports_1 = __importDefault(require("./routes/reports"));
const settings_1 = __importDefault(require("./routes/settings"));
const customers_1 = __importDefault(require("./routes/customers"));
const finances_1 = __importDefault(require("./routes/finances"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const staff_1 = __importDefault(require("./routes/staff"));
const accounting_1 = __importDefault(require("./routes/accounting"));
const products_1 = __importDefault(require("./routes/products"));
const bills_1 = __importDefault(require("./routes/bills"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
// Middleware & Security Firewalls
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
// CRITICAL FIX: Increased payload limit to 10MB to support base64 logos and bulk inventories
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ limit: "10mb", extended: true }));
// Health Check Endpoint
app.get("/api/health", async (req, res) => {
    try {
        const categoryCount = await prisma.category.count();
        res.status(200).json({ status: "success", message: "API connected to MySQL!", categoryCount });
    }
    catch (error) {
        res.status(500).json({ status: "error", error: error.message });
    }
});
// Mount API Routes
app.use("/api/auth", auth_1.default);
app.use("/api/inventory", inventory_1.default);
app.use("/api/pos", pos_1.default);
app.use("/api/reports", reports_1.default);
app.use("/api/settings", settings_1.default);
app.use("/api/customers", customers_1.default);
app.use("/api/finances", finances_1.default);
app.use("/api/suppliers", suppliers_1.default);
app.use("/api/staff", staff_1.default);
app.use("/api/accounting", accounting_1.default);
app.use("/api/products", products_1.default);
app.use("/api/bills", bills_1.default);
app.use("/api/businesses", businesses_1.default);
// Start Server
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`TradeMatrix Server running on http://localhost:${PORT}`);
});
