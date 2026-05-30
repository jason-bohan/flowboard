import { Router, type Request, type Response } from 'express';

interface DebitCard {
    id: number;
    cardHolder: string;
    cardLastFour: string;
    cardNetwork: 'Visa' | 'Mastercard';
    accountNumber: string;
    expirationDate: string;
    cvv: string;
    status: 'active' | 'locked' | 'suspended' | 'lost' | 'stolen' | 'expired';
    isActivated: boolean;
    dailyLimit: number;
    isContactless: boolean;
    issuedAt: string;
    lockedAt: string | null;
}

const cards: DebitCard[] = [
    {
        id: 1,
        cardHolder: 'Jane Doe',
        cardLastFour: '4521',
        cardNetwork: 'Visa',
        accountNumber: '****6789',
        expirationDate: '06/28',
        cvv: '***',
        status: 'active',
        isActivated: true,
        dailyLimit: 2500,
        isContactless: true,
        issuedAt: '2024-01-15T00:00:00Z',
        lockedAt: null,
    },
    {
        id: 2,
        cardHolder: 'John Doe',
        cardLastFour: '7834',
        cardNetwork: 'Mastercard',
        accountNumber: '****3456',
        expirationDate: '09/27',
        cvv: '***',
        status: 'locked',
        isActivated: true,
        dailyLimit: 1500,
        isContactless: true,
        issuedAt: '2025-03-01T00:00:00Z',
        lockedAt: '2026-05-29T14:00:00Z',
    },
];

const router = Router();

router.get('/', (_req: Request, res: Response) => {
    res.json(cards.map((c) => ({ ...c, cvv: '***', accountNumber: `****${c.accountNumber.slice(-4)}` })));
});

router.get('/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const card = cards.find((c) => c.id === id);
    if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
    res.json({ ...card, cvv: '***', accountNumber: `****${card.accountNumber.slice(-4)}` });
});

router.post('/:id/lock', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const card = cards.find((c) => c.id === id);
    if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
    if (card.status === 'lost' || card.status === 'stolen') { res.status(400).json({ error: 'Lost or stolen cards cannot be locked — please request a replacement' }); return; }

    card.status = 'locked';
    card.lockedAt = new Date().toISOString();
    res.json({ message: 'Card locked successfully', card: { ...card, cvv: '***', accountNumber: `****${card.accountNumber.slice(-4)}` } });
});

router.post('/:id/unlock', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const card = cards.find((c) => c.id === id);
    if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
    if (card.status !== 'locked') { res.status(400).json({ error: 'Card is not locked' }); return; }

    card.status = 'active';
    card.lockedAt = null;
    res.json({ message: 'Card unlocked successfully', card: { ...card, cvv: '***', accountNumber: `****${card.accountNumber.slice(-4)}` } });
});

router.post('/:id/activate', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const card = cards.find((c) => c.id === id);
    if (!card) { res.status(404).json({ error: 'Card not found' }); return; }
    if (card.isActivated) { res.status(400).json({ error: 'Card is already activated' }); return; }

    const { dob, ssn } = req.body as { dob?: string; ssn?: string };
    if (!dob || !ssn) { res.status(400).json({ error: 'Date of birth and last 4 SSN required for identity verification' }); return; }

    card.isActivated = true;
    card.status = 'active';
    res.json({ message: 'Card activated successfully', card: { ...card, cvv: '***', accountNumber: `****${card.accountNumber.slice(-4)}` } });
});

router.post('/:id/report-fraud', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const card = cards.find((c) => c.id === id);
    if (!card) { res.status(404).json({ error: 'Card not found' }); return; }

    const { reportedBy, transactionId } = req.body as { reportedBy?: string; transactionId?: string };
    if (!reportedBy) { res.status(400).json({ error: 'reportedBy is required' }); return; }

    card.status = 'suspended';
    res.json({
        message: 'Fraud reported — card suspended',
        fraudCase: {
            id: `FR-${Date.now()}`,
            cardId: id,
            cardLastFour: card.cardLastFour,
            reportedBy,
            transactionId: transactionId ?? null,
            status: 'investigating',
            reportedAt: new Date().toISOString(),
            evidence: 'customer-report-filed, transaction-reviewed, card-suspended',
        },
    });
});

router.post('/:id/request-replacement', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const card = cards.find((c) => c.id === id);
    if (!card) { res.status(404).json({ error: 'Card not found' }); return; }

    const { reason, shippingAddress } = req.body as { reason?: string; shippingAddress?: string };
    card.status = 'expired';
    const replacement: DebitCard = {
        id: cards.length + 1,
        cardHolder: card.cardHolder,
        cardLastFour: `${Math.floor(1000 + Math.random() * 9000)}`,
        cardNetwork: card.cardNetwork,
        accountNumber: card.accountNumber,
        expirationDate: '06/30',
        cvv: '***',
        status: 'active',
        isActivated: false,
        dailyLimit: card.dailyLimit,
        isContactless: true,
        issuedAt: new Date().toISOString(),
        lockedAt: null,
    };
    cards.push(replacement);
    res.json({ message: 'Replacement card ordered', newCard: { ...replacement, cvv: '***', accountNumber: `****${replacement.accountNumber.slice(-4)}` }, shippingAddress: shippingAddress ?? 'on file' });
});

router.post('/mobile-deposit', (req: Request, res: Response) => {
    const { amount, depositMethod } = req.body as { amount?: number; depositMethod?: 'standard' | 'immediate' };
    if (amount == null || amount <= 0) { res.status(400).json({ error: 'Valid amount is required' }); return; }

    const method = depositMethod ?? 'standard';
    const fee = method === 'immediate' ? Math.max(2, amount * 0.02) : 0;
    const availability = method === 'immediate' ? 'immediate' : 'next-business-day';

    res.json({
        message: `${method === 'immediate' ? 'Immediate' : 'Standard'} deposit submitted`,
        depositAmount: amount,
        fee,
        netDeposit: amount - fee,
        availability,
        depositMethod: method,
        depositedAt: new Date().toISOString(),
    });
});

export default router;
