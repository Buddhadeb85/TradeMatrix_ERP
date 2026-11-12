import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Ensure core chart of accounts exist in database
export async function seedDefaultAccounts(tx: any) {
    const defaultAccounts = [
        { name: "Cash-in-Hand / Bank", type: "ASSET" },
        { name: "Accounts Receivable", type: "ASSET" },
        { name: "Inventory Asset", type: "ASSET" },
        { name: "Sales Revenue", type: "INCOME" },
        { name: "Accounts Payable", type: "LIABILITY" },
        { name: "Operating Expenses", type: "EXPENSE" },
        { name: "Salary Expense", type: "EXPENSE" }
    ];

    for (const acc of defaultAccounts) {
        await tx.account.upsert({
            where: { name: acc.name },
            update: {},
            create: acc
        });
    }
}

// Post a balanced double-entry journal
export async function postJournalEntry(tx: any, reference: string, notes: string, lines: { accountName: string; debit: number; credit: number }[]) {
    await seedDefaultAccounts(tx);

    const journalEntry = await tx.journalEntry.create({
        data: {
            reference,
            notes
        }
    });

    for (const line of lines) {
        const account = await tx.account.findUnique({ where: { name: line.accountName } });
        if (!account) throw new Error(`Account "${line.accountName}" not found in general ledger`);

        await tx.journalLine.create({
            data: {
                journalEntryId: journalEntry.id,
                accountId: account.id,
                debit: line.debit,
                credit: line.credit
            }
        });

        // Update account running balance
        const balanceChange = Number(line.debit) - Number(line.credit);
        const isNormalDebit = account.type === "ASSET" || account.type === "EXPENSE";
        const multiplier = isNormalDebit ? 1 : -1;

        await tx.account.update({
            where: { id: account.id },
            data: { balance: { increment: balanceChange * multiplier } }
        });
    }

    return journalEntry;
}
