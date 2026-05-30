import { Router, type Request, type Response } from 'express';

interface Invoice {
    id: number;
    clientName: string;
    amount: number;
    currency: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
    issuedAt: string;
    paidAt: string | null;
}

interface Payment {
    id: number;
    invoiceId: number;
    amount: number;
    fee: number;
    method: 'ach' | 'wire' | 'card';
    cardLastFour: string | null;
    settledAt: string;
}

const invoices: Invoice[] = [
    { id: 1, clientName: 'Acme Corp', amount: 5000.00, currency: 'USD', status: 'paid', issuedAt: '2026-05-01T00:00:00Z', paidAt: '2026-05-05T00:00:00Z' },
    { id: 2, clientName: 'Beta Inc', amount: 1200.50, currency: 'USD', status: 'overdue', issuedAt: '2026-04-15T00:00:00Z', paidAt: null },
];

const payments: Payment[] = [
    { id: 1, invoiceId: 1, amount: 5000.00, fee: 25.00, method: 'ach', cardLastFour: null, settledAt: '2026-05-05T00:00:00Z' },
];

const router = Router();

router.get('/', (_req: Request, res: Response) => {
    res.json(invoices);
});

router.get('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
    res.json(invoice);
});

router.post('/', (req: Request, res: Response) => {
    const { clientName, amount, currency } = req.body as {
        clientName?: string;
        amount?: number;
        currency?: string;
    };
    if (!clientName || amount == null) {
        res.status(400).json({ error: 'clientName and amount are required' });
        return;
    }
    const invoice: Invoice = {
        id: invoices.length + 1,
        clientName,
        amount,
        currency: currency ?? 'USD',
        status: 'draft',
        issuedAt: new Date().toISOString(),
        paidAt: null,
    };
    invoices.push(invoice);
    res.status(201).json(invoice);
});

router.post('/:id/pay', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }

    const { method, cardNumber } = req.body as { method?: string; cardNumber?: string };
    if (!method) { res.status(400).json({ error: 'Payment method is required' }); return; }

    const feeRate = method === 'card' ? 0.029 : 0.005;
    const fee = Math.round(invoice.amount * feeRate * 100) / 100;
    const lastFour = cardNumber ? cardNumber.slice(-4) : null;

    const payment: Payment = {
        id: payments.length + 1,
        invoiceId: id,
        amount: invoice.amount,
        fee,
        method: method as Payment['method'],
        cardLastFour: lastFour,
        settledAt: new Date().toISOString(),
    };
    payments.push(payment);
    invoice.status = 'paid';
    invoice.paidAt = payment.settledAt;

    res.json({ invoice, payment });
});

router.post('/:id/refund', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) { res.status(404).json({ error: 'Invoice not found' }); return; }
    if (invoice.status !== 'paid') { res.status(400).json({ error: 'Only paid invoices can be refunded' }); return; }

    invoice.status = 'draft';
    invoice.paidAt = null;
    res.json({ message: `Refund processed for invoice ${id}`, invoice });
});

export default router;
