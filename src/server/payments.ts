import { Router, type Request, type Response } from 'express';

interface ExternalTransfer {
    id: number;
    fromAccount: string;
    toAccount: string;
    toBankName: string;
    routingNumber: string;
    accountNumber: string;
    amount: number;
    method: 'ach' | 'wire' | 'internal';
    frequency: 'one-time' | 'recurring';
    recurringSchedule: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    fee: number;
    approvalId: number | null;
    note: string;
    createdAt: string;
    completedAt: string | null;
}

interface BillPayee {
    id: number;
    name: string;
    accountNumber: string;
    routingNumber: string;
    category: string;
    autoPay: boolean;
    autoPayAmount: number | null;
    autoPaySchedule: string | null;
}

const transfers: ExternalTransfer[] = [
    {
        id: 1,
        fromAccount: 'Checking (*4567)',
        toAccount: 'Rent Payment',
        toBankName: 'Landlord Banking',
        routingNumber: '021000021',
        accountNumber: '****8901',
        amount: 1800.00,
        method: 'ach',
        frequency: 'recurring',
        recurringSchedule: 'monthly on the 1st',
        status: 'completed',
        fee: 0,
        approvalId: null,
        note: 'Monthly rent',
        createdAt: '2026-05-01T08:00:00Z',
        completedAt: '2026-05-01T08:05:00Z',
    },
    {
        id: 2,
        fromAccount: 'Savings (*7890)',
        toAccount: 'Jane Q Public',
        toBankName: 'External Credit Union',
        routingNumber: '031100209',
        accountNumber: '****2345',
        amount: 250.00,
        method: 'ach',
        frequency: 'one-time',
        recurringSchedule: null,
        status: 'pending',
        fee: 0.50,
        approvalId: null,
        note: 'Birthday gift',
        createdAt: '2026-05-30T12:00:00Z',
        completedAt: null,
    },
];

const payees: BillPayee[] = [
    { id: 1, name: 'Electric Company', accountNumber: '****5678', routingNumber: '021000021', category: 'utilities', autoPay: true, autoPayAmount: 120.00, autoPaySchedule: 'monthly on the 15th' },
    { id: 2, name: 'Internet Provider', accountNumber: '****9012', routingNumber: '021000021', category: 'utilities', autoPay: true, autoPayAmount: 85.00, autoPaySchedule: 'monthly on the 10th' },
    { id: 3, name: 'Credit Card Payment', accountNumber: '****3456', routingNumber: '021000021', category: 'credit', autoPay: false, autoPayAmount: null, autoPaySchedule: null },
];

const router = Router();

router.get('/transactions', (_req: Request, res: Response) => {
    res.json(transfers.map((t) => ({ ...t, accountNumber: `****${t.accountNumber.slice(-4)}` })));
});

router.post('/transactions', (req: Request, res: Response) => {
    const { fromAccount, toAccount, toBankName, routingNumber, accountNumber, amount, method, frequency } = req.body as Record<string, unknown>;
    if (!fromAccount || !toAccount || amount == null) {
        res.status(400).json({ error: 'fromAccount, toAccount, and amount are required' });
        return;
    }

    const transferMethod = method === 'wire' ? 'wire' : 'ach';
    const fee = transferMethod === 'wire' ? 25.00 : Number(amount) >= 1000 ? 0.50 : 0;

    const transfer: ExternalTransfer = {
        id: transfers.length + 1,
        fromAccount: String(fromAccount),
        toAccount: String(toAccount),
        toBankName: String(toBankName ?? ''),
        routingNumber: String(routingNumber ?? ''),
        accountNumber: accountNumber ? `****${String(accountNumber).slice(-4)}` : '',
        amount: Number(amount),
        method: transferMethod,
        frequency: frequency === 'recurring' ? 'recurring' : 'one-time',
        recurringSchedule: null,
        status: 'pending',
        fee,
        approvalId: Number(amount) >= 10000 ? transfers.length + 1 : null,
        note: String(req.body.note ?? ''),
        createdAt: new Date().toISOString(),
        completedAt: null,
    };
    transfers.push(transfer);
    res.status(201).json(transfer);
});

router.post('/transactions/:id/approve', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const transfer = transfers.find((t) => t.id === id);
    if (!transfer) { res.status(404).json({ error: 'Transfer not found' }); return; }

    const { approvedBy } = req.body as { approvedBy?: string };
    if (!approvedBy) { res.status(400).json({ error: 'Transfer approval requires approvedBy' }); return; }

    transfer.approvalId = id;
    transfer.status = 'processing';
    res.json({ message: 'Transfer approved for processing', approvedBy, approvalId: id });
});

router.get('/bill-payees', (_req: Request, res: Response) => {
    res.json(payees);
});

router.post('/bill-payees', (req: Request, res: Response) => {
    const { name, accountNumber, routingNumber, category } = req.body as Record<string, unknown>;
    if (!name) { res.status(400).json({ error: 'Payee name is required' }); return; }

    const payee: BillPayee = {
        id: payees.length + 1,
        name: String(name),
        accountNumber: String(accountNumber ?? ''),
        routingNumber: String(routingNumber ?? ''),
        category: String(category ?? 'other'),
        autoPay: false,
        autoPayAmount: null,
        autoPaySchedule: null,
    };
    payees.push(payee);
    res.status(201).json(payee);
});

router.post('/bill-payees/:id/pay', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const payee = payees.find((p) => p.id === id);
    if (!payee) { res.status(404).json({ error: 'Payee not found' }); return; }

    const { amount } = req.body as { amount?: number };
    if (amount == null || amount <= 0) { res.status(400).json({ error: 'Valid amount is required' }); return; }

    res.json({
        message: `Bill payment to ${payee.name} for $${amount.toFixed(2)} scheduled`,
        payee: payee.name,
        amount,
        scheduledDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        paymentMethod: 'ach',
        confirmationCode: `BP-${Date.now().toString(36).toUpperCase()}`,
    });
});

router.post('/zelle', (req: Request, res: Response) => {
    const { recipientEmail, recipientPhone, amount, note } = req.body as Record<string, unknown>;
    if (!recipientEmail && !recipientPhone) { res.status(400).json({ error: 'recipientEmail or recipientPhone is required' }); return; }
    if (amount == null || Number(amount) <= 0) { res.status(400).json({ error: 'Valid amount is required' }); return; }
    if (Number(amount) > 3000) { res.status(400).json({ error: 'Zelle transfers over $3,000 require approval — use wire or ACH instead' }); return; }

    res.json({
        message: `Zelle transfer of $${Number(amount).toFixed(2)} sent`,
        recipient: recipientEmail ?? recipientPhone,
        amount: Number(amount),
        note: note ?? '',
        status: 'completed',
        sentAt: new Date().toISOString(),
        confirmationCode: `ZL-${Date.now().toString(36).toUpperCase()}`,
    });
});

export default router;
