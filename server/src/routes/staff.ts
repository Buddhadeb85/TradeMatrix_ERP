import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET all staff with their latest attendance and payrolls
router.get("/", async (req: Request, res: Response) => {
    try {
        const staffList = await prisma.staff.findMany({
            include: {
                attendances: { orderBy: { date: "desc" } },
                payrolls: { orderBy: { paymentDate: "desc" } }
            },
            orderBy: { name: "asc" }
        });
        res.json(staffList);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// MARK DAILY ATTENDANCE (Upsert for specific date)
router.post("/attendance", async (req: Request, res: Response) => {
    try {
        const { staffId, date, status, overtimeHrs } = req.body; // status: PRESENT, ABSENT, HALF_DAY
        if (!staffId || !date || !status) {
            return res.status(400).json({ error: "Staff ID, date, and status are required." });
        }

        const attendanceDate = new Date(date);

        // Check if attendance already exists for this date, update or create
        const existing = await prisma.attendance.findFirst({
            where: {
                staffId: Number(staffId),
                date: attendanceDate
            }
        });

        let attendance;
        if (existing) {
            attendance = await prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    status,
                    overtimeHrs: Number(overtimeHrs || 0)
                }
            });
        } else {
            attendance = await prisma.attendance.create({
                data: {
                    staffId: Number(staffId),
                    date: attendanceDate,
                    status,
                    overtimeHrs: Number(overtimeHrs || 0)
                }
            });
        }

        res.status(201).json({ status: "success", attendance });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to mark attendance." });
    }
});

// ADVANCED SALARY DISBURSEMENT WITH DUAL-ENTRY P&L SYNC
router.post("/payroll/disburse", async (req: Request, res: Response) => {
    try {
        const businessId = Number(req.headers["x-business-id"]) || 1;
        const { staffId, month, baseSalary, deductions, bonus, incentive, paymentMethod, notes } = req.body;

        if (!staffId || !month || !baseSalary) {
            return res.status(400).json({ error: "Staff ID, month, and base salary are required." });
        }

        const bSal = Number(baseSalary);
        const ded = Number(deductions || 0);
        const bon = Number(bonus || 0);
        const inc = Number(incentive || 0);
        
        // Net Paid Calculation: Base - Deductions + Bonus + Incentive
        const netPaid = Math.max(0, bSal - ded + bon + inc);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Payroll Record
            const payroll = await tx.payroll.create({
                data: {
                    staffId: Number(staffId),
                    month, // e.g., "2026-11"
                    baseSalary: bSal,
                    deductions: ded,
                    netPaid,
                    paymentDate: new Date()
                }
            });

            // 2. Record as Operating Expense so it syncs directly with P&L
            const staffMember = await tx.staff.findUnique({ where: { id: Number(staffId) } });
            await tx.expense.create({
                data: {
                    category: "SALARY_PAYROLL",
                    amount: netPaid,
                    paidTo: staffMember?.name || "Staff Member",
                    notes: `Salary disbursed for month ${month}. Base: ${bSal}, Ded: ${ded}, Bonus: ${bon}, Inc: ${inc}. Note: ${notes || ""}`,
                    date: new Date()
                }
            });

            // 3. Dual-Entry Ledger Synchronization (Debit Salary Expense / Credit Cash or Bank Asset)
            // Find or log Journal Entry for double-entry compliance
            await tx.journalEntry.create({
                data: {
                    reference: `PAYROLL-${staffId}-${month}`,
                    notes: `Monthly salary disbursement for ${staffMember?.name} (${month})`,
                    lines: {
                        create: [
                            {
                                account: {
                                    connectOrCreate: {
                                        where: { name: "Salary Expense" },
                                        create: { name: "Salary Expense", type: "EXPENSE" }
                                    }
                                },
                                debit: netPaid,
                                credit: 0
                            },
                            {
                                account: {
                                    connectOrCreate: {
                                        where: { name: paymentMethod === "BANK" ? "Bank Account" : "Cash in Hand" },
                                        create: { name: paymentMethod === "BANK" ? "Bank Account" : "Cash in Hand", type: "ASSET" }
                                    }
                                },
                                debit: 0,
                                credit: netPaid
                            }
                        ]
                    }
                }
            });

            return payroll;
        });

        res.status(201).json({ status: "success", message: "Salary disbursed and synced with P&L successfully.", result });
    } catch (error: any) {
        console.error("Payroll error:", error);
        res.status(500).json({ error: error.message || "Failed to disburse payroll." });
    }
});

export default router;