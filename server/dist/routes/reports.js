"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/summary", async (req, res) => {
    try {
        const products = await prisma.product.findMany({ include: { stockMovements: true, category: true } });
        const bills = await prisma.bill.findMany({ include: { items: { include: { product: { include: { category: true } } } }, customer: true }, orderBy: { createdAt: "desc" } });
        const customers = await prisma.customer.findMany({ include: { transactions: true } });
        const suppliers = await prisma.supplier.findMany({ include: { purchases: true, transactions: true } });
        const staffList = await prisma.staff.findMany({ include: { attendances: true, payrolls: true } });
        const expenses = await prisma.expense.findMany();
        const payrolls = await prisma.payroll.findMany();
        let inventoryCostValue = 0;
        let lowStockCount = 0;
        products.forEach(product => {
            const currentStock = product.stockMovements.reduce((acc, m) => {
                const qty = Number(m.quantity);
                if (m.type === "OPENING" || m.type === "RECEIVED" || m.type === "ADJUSTMENT")
                    return acc + qty;
                if (m.type === "REMOVED" || m.type === "SALE")
                    return acc - qty;
                return acc;
            }, 0);
            inventoryCostValue += currentStock * Number(product.costPrice);
            if (currentStock <= Number(product.lowStockLevel))
                lowStockCount++;
        });
        const totalSalesRevenue = bills.reduce((acc, b) => acc + Number(b.totalAmount), 0);
        const totalCustomerDue = customers.reduce((acc, c) => acc + Number(c.currentDue), 0);
        const totalSupplierPayable = suppliers.reduce((acc, s) => acc + Number(s.currentDue), 0);
        const totalOperatingExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
        const totalPayrollPaid = payrolls.reduce((acc, p) => acc + Number(p.netPaid), 0);
        const paymentTotals = {};
        const dayWiseSales = {};
        const monthWiseSales = {};
        const productWiseSales = {};
        const categoryWiseSales = {};
        const customerWiseSales = {};
        bills.forEach(b => {
            paymentTotals[b.paymentMethod] = (paymentTotals[b.paymentMethod] || 0) + Number(b.totalAmount);
            const dateStr = new Date(b.createdAt).toISOString().split("T")[0];
            dayWiseSales[dateStr] = (dayWiseSales[dateStr] || 0) + Number(b.totalAmount);
            const monthStr = dateStr.substring(0, 7);
            monthWiseSales[monthStr] = (monthWiseSales[monthStr] || 0) + Number(b.totalAmount);
            if (b.customer) {
                customerWiseSales[b.customer.name] = (customerWiseSales[b.customer.name] || 0) + Number(b.totalAmount);
            }
            else {
                customerWiseSales["Walk-in Customer"] = (customerWiseSales["Walk-in Customer"] || 0) + Number(b.totalAmount);
            }
            b.items.forEach(item => {
                const pId = String(item.productId);
                const pName = item.product?.name || "Unknown Product";
                const catName = item.product?.category?.name || "General";
                const qty = Number(item.quantity);
                const revenue = qty * Number(item.price);
                if (!productWiseSales[pId])
                    productWiseSales[pId] = { name: pName, qty: 0, revenue: 0 };
                productWiseSales[pId].qty += qty;
                productWiseSales[pId].revenue += revenue;
                categoryWiseSales[catName] = (categoryWiseSales[catName] || 0) + revenue;
            });
        });
        const expenseWise = {};
        expenses.forEach(e => {
            expenseWise[e.category] = (expenseWise[e.category] || 0) + Number(e.amount);
        });
        const supplierWise = {};
        suppliers.forEach(s => {
            supplierWise[s.name] = Number(s.currentDue);
        });
        const staffWise = {};
        staffList.forEach(st => {
            const paid = st.payrolls.reduce((acc, p) => acc + Number(p.netPaid), 0);
            const presentCount = st.attendances.filter(a => a.status === "PRESENT").length;
            staffWise[st.name] = { payrollPaid: paid, attendanceCount: presentCount };
        });
        res.json({
            totalActiveProducts: products.length,
            lowStockCount,
            inventoryCostValue,
            totalSalesRevenue,
            totalTransactions: bills.length,
            totalCustomerDue,
            totalSupplierPayable,
            totalOperatingExpenses,
            totalPayrollPaid,
            netOperatingProfit: totalSalesRevenue - (totalOperatingExpenses + totalPayrollPaid),
            paymentTotals,
            dayWiseSales,
            monthWiseSales,
            productWiseSales: Object.values(productWiseSales),
            categoryWiseSales,
            customerWiseSales,
            supplierWise,
            expenseWise,
            staffWise,
            recentBills: bills.slice(0, 10)
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get("/tax-filing", async (req, res) => {
    try {
        const bills = await prisma.bill.findMany({
            include: { items: { include: { product: true } } }
        });
        const taxSlabs = {
            "0%": { taxableAmount: 0, taxCollected: 0 },
            "5%": { taxableAmount: 0, taxCollected: 0 },
            "12%": { taxableAmount: 0, taxCollected: 0 },
            "18%": { taxableAmount: 0, taxCollected: 0 }
        };
        bills.forEach(bill => {
            bill.items.forEach(item => {
                const rate = Number(item.product?.gstRate || 5);
                const slabKey = `${rate}%` in taxSlabs ? `${rate}%` : "5%";
                const itemTotal = Number(item.price) * Number(item.quantity);
                const taxableVal = itemTotal / (1 + rate / 100);
                const taxVal = itemTotal - taxableVal;
                taxSlabs[slabKey].taxableAmount += taxableVal;
                taxSlabs[slabKey].taxCollected += taxVal;
            });
        });
        res.json({
            status: "success",
            totalBillsAnalyzed: bills.length,
            taxSlabs
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
