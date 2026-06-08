import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('External Payments API — ACH, wire, Bill Pay, Zelle', () => {
    it('lists transfers', async () => {
        const res = await request(app).get('/api/payments/transactions');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('creates an ACH transfer', async () => {
        const res = await request(app)
            .post('/api/payments/transactions')
            .send({ fromAccount: 'Checking (*4567)', toAccount: 'Friend Payment', routingNumber: '021000021', accountNumber: '123456789', amount: 150.00, method: 'ach' });

        expect(res.status).toBe(201);
        expect(res.body.method).toBe('ach');
        expect(res.body.status).toBe('pending');
    });

    it('creates a wire transfer with fee', async () => {
        const res = await request(app)
            .post('/api/payments/transactions')
            .send({ fromAccount: 'Checking (*4567)', toAccount: 'Escrow Account', routingNumber: '021000021', accountNumber: '987654321', amount: 50000.00, method: 'wire' });

        expect(res.status).toBe(201);
        expect(res.body.method).toBe('wire');
        expect(res.body.fee).toBe(25.00);
    });

    it('requires approval for large transfers', async () => {
        const res = await request(app)
            .post('/api/payments/transactions')
            .send({ fromAccount: 'Checking (*4567)', toAccount: 'Large Vendor', routingNumber: '021000021', accountNumber: '555555555', amount: 25000.00, method: 'ach' });

        expect(res.status).toBe(201);
        expect(res.body.approvalId).toBeTruthy();
    });

    it('approves a pending transfer', async () => {
        const created = await request(app)
            .post('/api/payments/transactions')
            .send({ fromAccount: 'Checking (*4567)', toAccount: 'Approved Payee', routingNumber: '021000021', accountNumber: '111111111', amount: 500.00, method: 'ach' });

        const res = await request(app)
            .post(`/api/payments/transactions/${created.body.id}/approve`)
            .send({ approvedBy: 'manager-7' });

        expect(res.status).toBe(200);
        expect(res.body.message).toContain('approved');
    });

    it('sends a Zelle payment', async () => {
        const res = await request(app)
            .post('/api/payments/zelle')
            .send({ recipientEmail: 'friend@example.com', amount: 75.00, note: 'Dinner' });

        expect(res.status).toBe(200);
        expect(res.body.confirmationCode).toContain('ZL-');
    });

    it('lists bill payees', async () => {
        const res = await request(app).get('/api/payments/bill-payees');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('schedules a bill payment with ACH', async () => {
        const res = await request(app)
            .post('/api/payments/bill-payees/1/pay')
            .send({ amount: 120.00 });

        expect(res.status).toBe(200);
        expect(res.body.paymentMethod).toBe('ach');
        expect(res.body.confirmationCode).toContain('BP-');
    });
});
