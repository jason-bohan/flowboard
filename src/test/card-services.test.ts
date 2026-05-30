import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Card Services API — debit card management and fraud', () => {
    it('lists all cards with masked details', async () => {
        const res = await request(app).get('/api/cards');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].cvv).toBe('***');
    });

    it('locks a card', async () => {
        const res = await request(app).post('/api/cards/1/lock');

        expect(res.status).toBe(200);
        expect(res.body.card.status).toBe('locked');
    });

    it('unlocks a previously locked card', async () => {
        await request(app).post('/api/cards/1/lock');

        const res = await request(app).post('/api/cards/1/unlock');

        expect(res.status).toBe(200);
        expect(res.body.card.status).toBe('active');
    });

    it('reports fraud and suspends card with evidence', async () => {
        const res = await request(app)
            .post('/api/cards/1/report-fraud')
            .send({ reportedBy: 'customer-jane', transactionId: 'TX-98765' });

        expect(res.status).toBe(200);
        expect(res.body.fraudCase.status).toBe('investigating');
        expect(res.body.fraudCase.evidence).toContain('customer-report-filed');
    });

    it('processes mobile check deposit with immediate funds fee', async () => {
        const res = await request(app)
            .post('/api/cards/mobile-deposit')
            .send({ amount: 500.00, depositMethod: 'immediate' });

        expect(res.status).toBe(200);
        expect(res.body.fee).toBe(10.00); // 2% of 500
        expect(res.body.netDeposit).toBe(490.00);
    });

    it('processes standard mobile deposit with no fee', async () => {
        const res = await request(app)
            .post('/api/cards/mobile-deposit')
            .send({ amount: 200.00, depositMethod: 'standard' });

        expect(res.status).toBe(200);
        expect(res.body.fee).toBe(0);
    });

    it('requests replacement card', async () => {
        const res = await request(app)
            .post('/api/cards/1/request-replacement')
            .send({ reason: 'lost', shippingAddress: '123 Main St' });

        expect(res.status).toBe(200);
        expect(res.body.newCard).toHaveProperty('cardLastFour');
    });
});
