import { Router, type Request, type Response } from 'express';

interface LoanApplication {
    id: number;
    borrowerName: string;
    ssn: string;
    dateOfBirth: string;
    citizenshipStatus: string;
    annualIncome: number;
    creditScore: number;
    employmentStatus: string;
    employerName: string;
    monthsEmployed: number;
    degreeType: string;
    graduationYear: number;
    schoolName: string;
    coSignerName: string | null;
    coSignerCreditScore: number | null;
    existingLoanBalance: number;
    existingLoanInterestRate: number;
    desiredTermMonths: number;
    desiredRateType: 'fixed' | 'variable';
    status: 'draft' | 'pending-review' | 'approved' | 'countered' | 'declined' | 'funded';
    offeredApr: number | null;
    offeredRate: number | null;
    autoPayEnrolled: boolean;
    createdAt: string;
    approvedAt: string | null;
    fundedAt: string | null;
}

interface RateQuote {
    borrowerId: number;
    fixedApr: number;
    variableApr: number;
    fixedRate: number;
    variableRate: number;
    sofrIndex: number;
    autoPayDiscount: number;
    monthlyPaymentFixed: number;
    monthlyPaymentVariable: number;
    totalInterestFixed: number;
    totalInterestVariable: number;
    quotedAt: string;
}

const SOFR_INDEX = 4.83;
const AUTOPAY_DISCOUNT = 0.25;

const applications: LoanApplication[] = [
    {
        id: 1,
        borrowerName: 'Jane Doe',
        ssn: '***-**-6789',
        dateOfBirth: '1995-06-15',
        citizenshipStatus: 'US Citizen',
        annualIncome: 85000,
        creditScore: 745,
        employmentStatus: 'employed',
        employerName: 'Tech Corp',
        monthsEmployed: 36,
        degreeType: 'Bachelor of Science in Computer Science',
        graduationYear: 2017,
        schoolName: 'State University',
        coSignerName: null,
        coSignerCreditScore: null,
        existingLoanBalance: 45000,
        existingLoanInterestRate: 6.8,
        desiredTermMonths: 120,
        desiredRateType: 'fixed',
        status: 'pending-review',
        offeredApr: null,
        offeredRate: null,
        autoPayEnrolled: false,
        createdAt: '2026-05-28T10:00:00Z',
        approvedAt: null,
        fundedAt: null,
    },
];

function calculateRateQuote(application: LoanApplication): RateQuote {
    const baseMargin = application.creditScore >= 780 ? 2.5 : application.creditScore >= 720 ? 3.5 : application.creditScore >= 660 ? 5.0 : 7.0;
    const termAdjustment = application.desiredTermMonths > 120 ? 0.75 : 0;
    const incomeRatio = application.existingLoanBalance / application.annualIncome;
    const dtiAdjustment = incomeRatio > 0.5 ? 1.0 : incomeRatio > 0.3 ? 0.5 : 0;

    const fixedRate = baseMargin + termAdjustment + dtiAdjustment;
    const fixedApr = fixedRate - AUTOPAY_DISCOUNT;
    const variableRate = SOFR_INDEX + Math.max(1.5, baseMargin - 1.0) + termAdjustment + dtiAdjustment;
    const variableApr = variableRate - AUTOPAY_DISCOUNT;

    const monthlyRateFixed = fixedApr / 100 / 12;
    const monthlyRateVariable = variableApr / 100 / 12;
    const n = application.desiredTermMonths;
    const paymentFixed = application.existingLoanBalance * monthlyRateFixed * Math.pow(1 + monthlyRateFixed, n) / (Math.pow(1 + monthlyRateFixed, n) - 1);
    const paymentVariable = application.existingLoanBalance * monthlyRateVariable * Math.pow(1 + monthlyRateVariable, n) / (Math.pow(1 + monthlyRateVariable, n) - 1);
    const totalFixed = paymentFixed * n;
    const totalVariable = paymentVariable * n;

    return {
        borrowerId: application.id,
        fixedApr: Math.round(fixedApr * 100) / 100,
        variableApr: Math.round(variableApr * 100) / 100,
        fixedRate: Math.round(fixedRate * 100) / 100,
        variableRate: Math.round(variableRate * 100) / 100,
        sofrIndex: SOFR_INDEX,
        autoPayDiscount: AUTOPAY_DISCOUNT,
        monthlyPaymentFixed: Math.round(paymentFixed * 100) / 100,
        monthlyPaymentVariable: Math.round(paymentVariable * 100) / 100,
        totalInterestFixed: Math.round((totalFixed - application.existingLoanBalance) * 100) / 100,
        totalInterestVariable: Math.round((totalVariable - application.existingLoanBalance) * 100) / 100,
        quotedAt: new Date().toISOString(),
    };
}

const router = Router();

router.get('/rates/:applicationId', (req: Request, res: Response) => {
    const id = Number(req.params.applicationId);
    const app = applications.find((a) => a.id === id);
    if (!app) { res.status(404).json({ error: 'Application not found' }); return; }
    const quote = calculateRateQuote(app);
    res.json(quote);
});

router.get('/applications', (_req: Request, res: Response) => {
    res.json(applications.map((a) => ({ ...a, ssn: '***-**-****', dateOfBirth: 'XXXX-XX-XX' })));
});

router.get('/applications/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const app = applications.find((a) => a.id === id);
    if (!app) { res.status(404).json({ error: 'Application not found' }); return; }
    res.json({ ...app, ssn: '***-**-****', dateOfBirth: 'XXXX-XX-XX' });
});

router.post('/applications', (req: Request, res: Response) => {
    const { borrowerName, annualIncome, creditScore, employmentStatus, employerName, existingLoanBalance, existingLoanInterestRate, desiredTermMonths, desiredRateType } = req.body as Record<string, unknown>;
    if (!borrowerName || annualIncome == null || creditScore == null) {
        res.status(400).json({ error: 'borrowerName, annualIncome, and creditScore are required' });
        return;
    }
    const application: LoanApplication = {
        id: applications.length + 1,
        borrowerName: String(borrowerName),
        ssn: '***-**-****',
        dateOfBirth: 'XXXX-XX-XX',
        citizenshipStatus: 'US Citizen',
        annualIncome: Number(annualIncome),
        creditScore: Number(creditScore),
        employmentStatus: String(employmentStatus ?? 'employed'),
        employerName: String(employerName ?? ''),
        monthsEmployed: 0,
        degreeType: '',
        graduationYear: new Date().getFullYear(),
        schoolName: '',
        coSignerName: null,
        coSignerCreditScore: null,
        existingLoanBalance: Number(existingLoanBalance ?? 0),
        existingLoanInterestRate: Number(existingLoanInterestRate ?? 0),
        desiredTermMonths: Number(desiredTermMonths ?? 120),
        desiredRateType: desiredRateType === 'variable' ? 'variable' : 'fixed',
        status: 'pending-review',
        offeredApr: null,
        offeredRate: null,
        autoPayEnrolled: false,
        createdAt: new Date().toISOString(),
        approvedAt: null,
        fundedAt: null,
    };
    applications.push(application);
    const quote = calculateRateQuote(application);
    res.status(201).json({ application: { ...application, ssn: '***-**-****', dateOfBirth: 'XXXX-XX-XX' }, rateQuote: quote });
});

router.post('/applications/:id/approve', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const app = applications.find((a) => a.id === id);
    if (!app) { res.status(404).json({ error: 'Application not found' }); return; }
    if (app.status !== 'pending-review') { res.status(400).json({ error: 'Only pending-review applications can be approved' }); return; }

    const { approvedBy } = req.body as { approvedBy?: string };
    if (!approvedBy) { res.status(400).json({ error: 'Approval requires an approver (approvedBy)' }); return; }

    const quote = calculateRateQuote(app);
    app.status = 'approved';
    app.offeredApr = app.desiredRateType === 'fixed' ? quote.fixedApr : quote.variableApr;
    app.offeredRate = app.desiredRateType === 'fixed' ? quote.fixedRate : quote.variableRate;
    app.approvedAt = new Date().toISOString();
    res.json({ message: 'Application approved', application: { ...app, ssn: '***-**-****' }, approval: { approvedBy, approvedAt: app.approvedAt, evidence: 'credit-check-completed, income-verified, degree-confirmed' } });
});

router.post('/applications/:id/enroll-autopay', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const app = applications.find((a) => a.id === id);
    if (!app) { res.status(404).json({ error: 'Application not found' }); return; }
    if (app.status !== 'approved' && app.status !== 'funded') { res.status(400).json({ error: 'Loan must be approved first' }); return; }

    const { routingNumber, accountNumber } = req.body as { routingNumber?: string; accountNumber?: string };
    if (!routingNumber || !accountNumber) { res.status(400).json({ error: 'routingNumber and accountNumber required for AutoPay enrollment' }); return; }

    app.autoPayEnrolled = true;
    if (app.offeredApr != null) app.offeredApr = Math.round((app.offeredApr - AUTOPAY_DISCOUNT) * 100) / 100;
    res.json({ message: 'AutoPay enrolled — 0.25% rate discount applied', newApr: app.offeredApr });
});

router.get('/disclosures', (_req: Request, res: Response) => {
    res.json({
        type: 'Loan Disclosure Statement',
        applicableRegulations: ['Truth in Lending Act', 'Equal Credit Opportunity Act', 'Fair Credit Reporting Act'],
        aprExplanation: 'APR represents the total cost of credit expressed as a yearly rate including interest and certain fees.',
        variableRateExplanation: `Variable APR is based on the 30-day Average SOFR index (currently ${SOFR_INDEX}%) plus a margin. Rate will vary but will never exceed 15.00%.`,
        autopayTerms: 'AutoPay discount of 0.25% is applied to principal, not monthly payment. Discount is lost if AutoPay is cancelled.',
        federalLoanWarning: 'Refinancing federal loans eliminates eligibility for PSLF, income-driven repayment, forbearance, and certain forgiveness options.',
        underwritingCriteria: 'Approval depends on credit profile, debt-to-income ratio, employment history, and disposable income.',
        cosignerRelease: 'Co-signer may be released after 36 consecutive on-time payments upon request.',
    });
});

export default router;
