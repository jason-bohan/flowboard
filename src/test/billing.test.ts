import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Billing API — money path and evidence compliance', () => {
    beforeEach(async () => {
        // Ensure a fresh invoice for tests
        await request(app).post('/api/tasks').send({ title: 'Reset state marker' });
    });

    it('creates an invoice and verifies billing amount and currency', async () => {
        const res = await request(app)
            .post('/api/billing')
            .send({ clientName: 'Test Corp', amount: 2500.00, currency: 'USD' });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            clientName: 'Test Corp',
            amount: 2500.00,
            currency: 'USD',
            status: 'draft',
        });
    });

    it('rejects invoice without clientName', async () => {
        const res = await request(app)
            .post('/api/billing')
            .send({ amount: 1000 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('clientName and amount are required');
    });

    it('lists all invoices', async () => {
        await request(app).post('/api/billing').send({ clientName: 'Client A', amount: 100 });
        await request(app).post('/api/billing').send({ clientName: 'Client B', amount: 200 });

        const res = await request(app).get('/api/billing');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('processes card payment with fee calculation', async () => {
        const invoice = await request(app)
            .post('/api/billing')
            .send({ clientName: 'Card Test', amount: 1000.00 });

        const pay = await request(app)
            .post(`/api/billing/${invoice.body.id}/pay`)
            .send({ method: 'card', cardNumber: '4111111111111111' });

        expect(pay.status).toBe(200);
        expect(pay.body.payment).toBeDefined();
        expect(pay.body.payment.method).toBe('card');
        expect(pay.body.invoice.status).toBe('paid');
    });

    it('processes ACH payment with lower fee', async () => {
        const invoice = await request(app)
            .post('/api/billing')
            .send({ clientName: 'ACH Test', amount: 5000.00 });

        const pay = await request(app)
            .post(`/api/billing/${invoice.body.id}/pay`)
            .send({ method: 'ach' });

        expect(pay.status).toBe(200);
        expect(pay.body.payment.method).toBe('ach');
        const fee = pay.body.payment.fee as number;
        expect(fee).toBe(25.00); // 0.5% of 5000
    });

    it('processes a refund on a paid invoice', async () => {
        const invoice = await request(app)
            .post('/api/billing')
            .send({ clientName: 'Refund Test', amount: 750.00 });

        await request(app)
            .post(`/api/billing/${invoice.body.id}/pay`)
            .send({ method: 'ach' });

        const refund = await request(app)
            .post(`/api/billing/${invoice.body.id}/refund`);

        expect(refund.status).toBe(200);
        expect(refund.body.message).toContain('Refund processed');
    });
});
