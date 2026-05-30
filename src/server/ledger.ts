import { Router, type Request, type Response } from 'express';

interface LedgerEntry {
    id: number;
    accountName: string;
    transactionType: 'credit' | 'debit';
    amount: number;
    balance: number;
    description: string;
    recordedAt: string;
}

const entries: LedgerEntry[] = [
    { id: 1, accountName: 'Operating Account', transactionType: 'credit', amount: 50000.00, balance: 50000.00, description: 'Initial deposit', recordedAt: '2026-01-01T00:00:00Z' },
    { id: 2, accountName: 'Operating Account', transactionType: 'debit', amount: 1500.00, balance: 48500.00, description: 'Office supplies', recordedAt: '2026-01-05T00:00:00Z' },
    { id: 3, accountName: 'Operating Account', transactionType: 'debit', amount: 3200.00, balance: 45300.00, description: 'Payroll processing fee', recordedAt: '2026-01-15T00:00:00Z' },
    { id: 4, accountName: 'Operating Account', transactionType: 'credit', amount: 5000.00, balance: 50300.00, description: 'Invoice payment from Acme Corp', recordedAt: '2026-05-05T00:00:00Z' },
];

const router = Router();

router.get('/', (_req: Request, res: Response) => {
    res.json(entries);
});

router.get('/balance', (_req: Request, res: Response) => {
    const latest = entries.reduce((max, e) => (e.id > max.id ? e : max), entries[0]);
    res.json({ accountName: latest.accountName, currentBalance: latest.balance, asOf: latest.recordedAt });
});

router.post('/', (req: Request, res: Response) => {
    const { accountName, transactionType, amount, description } = req.body as {
        accountName?: string;
        transactionType?: 'credit' | 'debit';
        amount?: number;
        description?: string;
    };
    if (!accountName || !transactionType || amount == null) {
        res.status(400).json({ error: 'accountName, transactionType, and amount are required' });
        return;
    }

    const lastBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
    const balance = transactionType === 'credit' ? lastBalance + amount : lastBalance - amount;

    const entry: LedgerEntry = {
        id: entries.length + 1,
        accountName,
        transactionType,
        amount,
        balance,
        description: description ?? '',
        recordedAt: new Date().toISOString(),
    };
    entries.push(entry);
    res.status(201).json(entry);
});

router.get('/reconciliation/:accountName', (req: Request, res: Response) => {
    const accountName = req.params.accountName;
    const accountEntries = entries.filter((e) => e.accountName === accountName);
    if (accountEntries.length === 0) {
        res.status(404).json({ error: 'No entries found for account' });
        return;
    }
    const totalCredits = accountEntries.filter((e) => e.transactionType === 'credit').reduce((s, e) => s + e.amount, 0);
    const totalDebits = accountEntries.filter((e) => e.transactionType === 'debit').reduce((s, e) => s + e.amount, 0);
    const reconciledBalance = totalCredits - totalDebits;
    res.json({
        accountName,
        totalCredits,
        totalDebits,
        reconciledBalance,
        entryCount: accountEntries.length,
        lastEntry: accountEntries[accountEntries.length - 1],
    });
});

export default router;
