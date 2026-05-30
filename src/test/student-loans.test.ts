import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Student Loans API — lending, credit, and rate disclosure', () => {
    it('returns rate quote for existing application', async () => {
        const res = await request(app).get('/api/student-loans/rates/1');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('fixedApr');
        expect(res.body).toHaveProperty('variableApr');
        expect(res.body).toHaveProperty('monthlyPaymentFixed');
        expect(res.body).toHaveProperty('totalInterestFixed');
        expect(res.body).toHaveProperty('sofrIndex');
    });

    it('creates a loan application and returns rate quote', async () => {
        const res = await request(app)
            .post('/api/student-loans/applications')
            .send({ borrowerName: 'Alice Smith', annualIncome: 95000, creditScore: 780, existingLoanBalance: 35000, desiredTermMonths: 120 });

        expect(res.status).toBe(201);
        expect(res.body.application).toHaveProperty('id');
        expect(res.body.rateQuote).toHaveProperty('fixedApr');
    });

    it('approves a loan application with approver evidence', async () => {
        const appRes = await request(app)
            .post('/api/student-loans/applications')
            .send({ borrowerName: 'Bob Jones', annualIncome: 120000, creditScore: 720, existingLoanBalance: 60000, desiredTermMonths: 84 });

        const id = appRes.body.application.id as number;

        const approveRes = await request(app)
            .post(`/api/student-loans/applications/${id}/approve`)
            .send({ approvedBy: 'underwriter-42' });

        expect(approveRes.status).toBe(200);
        expect(approveRes.body.application.status).toBe('approved');
        expect(approveRes.body.approval.evidence).toContain('credit-check');
    });

    it('enrolls in AutoPay and applies rate discount', async () => {
        const appRes = await request(app)
            .post('/api/student-loans/applications')
            .send({ borrowerName: 'Carol White', annualIncome: 80000, creditScore: 750, existingLoanBalance: 25000, desiredTermMonths: 60 });

        const id = appRes.body.application.id as number;

        await request(app)
            .post(`/api/student-loans/applications/${id}/approve`)
            .send({ approvedBy: 'underwriter-42' });

        const autopay = await request(app)
            .post(`/api/student-loans/applications/${id}/enroll-autopay`)
            .send({ routingNumber: '021000021', accountNumber: '123456789' });

        expect(autopay.status).toBe(200);
        expect(autopay.body.message).toContain('AutoPay');
    });

    it('returns loan disclosures with regulatory references', async () => {
        const res = await request(app).get('/api/student-loans/disclosures');

        expect(res.status).toBe(200);
        expect(res.body.applicableRegulations).toContain('Truth in Lending Act');
        expect(res.body.variableRateExplanation).toContain('SOFR');
        expect(res.body.federalLoanWarning).toContain('PSLF');
    });
});
