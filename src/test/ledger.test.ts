import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Ledger API — transaction, reconciliation, and audit trail', () => {
    it('returns current balance', async () => {
        const res = await request(app).get('/api/ledger/balance');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('currentBalance');
        expect(typeof res.body.currentBalance).toBe('number');
    });

    it('returns all ledger entries', async () => {
        const res = await request(app).get('/api/ledger');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const entry = res.body[0];
        expect(entry).toHaveProperty('transactionType');
        expect(entry).toHaveProperty('balance');
        expect(entry).toHaveProperty('recordedAt');
    });

    it('records a debit transaction and updates balance', async () => {
        const before = await request(app).get('/api/ledger/balance');
        const prevBalance = before.body.currentBalance as number;

        const res = await request(app)
            .post('/api/ledger')
            .send({ accountName: 'Operating Account', transactionType: 'debit', amount: 100.00, description: 'Test debit' });

        expect(res.status).toBe(201);
        expect(res.body.transactionType).toBe('debit');
        expect(res.body.balance).toBe(prevBalance - 100.00);
    });

    it('records a credit transaction and updates balance', async () => {
        const before = await request(app).get('/api/ledger/balance');
        const prevBalance = before.body.currentBalance as number;

        const res = await request(app)
            .post('/api/ledger')
            .send({ accountName: 'Operating Account', transactionType: 'credit', amount: 500.00, description: 'Test credit' });

        expect(res.status).toBe(201);
        expect(res.body.transactionType).toBe('credit');
        expect(res.body.balance).toBe(prevBalance + 500.00);
    });

    it('rejects entry without required fields', async () => {
        const res = await request(app)
            .post('/api/ledger')
            .send({ amount: 100 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('accountName, transactionType, and amount are required');
    });

    it('returns reconciliation for an account', async () => {
        const res = await request(app).get('/api/ledger/reconciliation/Operating Account');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accountName', 'Operating Account');
        expect(res.body).toHaveProperty('totalCredits');
        expect(res.body).toHaveProperty('totalDebits');
        expect(res.body).toHaveProperty('reconciledBalance');
        expect(res.body).toHaveProperty('entryCount');
    });
});
