import { Router, type Request, type Response } from 'express';

const router = Router();

const FINANCIAL_SERVICES = [
    { name: 'payments-api', type: 'api', baseRps: 1420, baseErr: 0.003, p50: 45, p95: 180, p99: 420, deps: ['ledger-service', 'auth-service', 'db-primary'] },
    { name: 'ledger-service', type: 'api', baseRps: 3100, baseErr: 0.001, p50: 12, p95: 48, p99: 120, deps: ['db-primary'] },
    { name: 'auth-service', type: 'api', baseRps: 5200, baseErr: 0.002, p50: 8, p95: 35, p99: 90, deps: ['redis-cache', 'db-primary'] },
    { name: 'card-processor', type: 'api', baseRps: 890, baseErr: 0.008, p50: 320, p95: 1200, p99: 2800, deps: ['auth-service', 'ach-gateway', 'db-primary'] },
    { name: 'billing-engine', type: 'api', baseRps: 430, baseErr: 0.004, p50: 210, p95: 850, p99: 1800, deps: ['ledger-service', 'db-primary'] },
    { name: 'ach-gateway', type: 'external', baseRps: 220, baseErr: 0.015, p50: 580, p95: 2400, p99: 5000, deps: [] },
    { name: 'db-primary', type: 'db', baseRps: 18500, baseErr: 0.0005, p50: 3, p95: 15, p99: 60, deps: [] },
    { name: 'redis-cache', type: 'cache', baseRps: 28000, baseErr: 0.0001, p50: 1, p95: 4, p99: 12, deps: [] },
];

function jitter() { return 0.85 + Math.random() * 0.3; }

function buildServices() {
    return FINANCIAL_SERVICES.map((svc) => {
        const errJitter = Math.random() * 2;
        return {
            name: svc.name,
            type: svc.type,
            metrics: {
                requestRate: Math.round(svc.baseRps * jitter()),
                errorRate: +(svc.baseErr * errJitter).toFixed(4),
                p50Latency: Math.round(svc.p50 * jitter()),
                p95Latency: Math.round(svc.p95 * jitter()),
                p99Latency: Math.round(svc.p99 * jitter()),
            },
            dependencies: svc.deps,
        };
    });
}

function buildErrorEvents() {
    const now = Date.now();
    const templates = [
        { msg: 'ACH gateway timeout after 5000ms', svc: 'ach-gateway', tags: { error_type: 'timeout' } },
        { msg: 'Insufficient funds for transfer #TX-', svc: 'ledger-service', tags: { error_type: 'business_rule' } },
        { msg: 'Card authorization declined: expired card', svc: 'card-processor', tags: { error_type: 'authorization_declined' } },
        { msg: 'Database connection pool exhausted', svc: 'db-primary', tags: { error_type: 'connection_pool' } },
        { msg: 'JWT token validation failed', svc: 'auth-service', tags: { error_type: 'auth' } },
        { msg: 'Payment settlement timeout for batch B-', svc: 'billing-engine', tags: { error_type: 'settlement_timeout' } },
    ];
    return templates.map((t, i) => ({
        id: `err-${i}-${now}`,
        message: `${t.msg}${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        stack: null,
        service: t.svc,
        environment: 'production',
        timestamp: new Date(now - i * 300_000 - Math.random() * 60_000).toISOString(),
        tags: t.tags,
    }));
}

function buildTraces(count = 8) {
    const now = Date.now();
    const svcs = FINANCIAL_SERVICES;
    const ops = ['process.payment', 'validate.auth', 'check.balance', 'deduct.funds', 'log.transaction', 'settle.batch', 'authorize.card', 'verify.identity'];
    const resources = ['/api/payments/transfer', '/api/auth/verify', '/api/ledger/balance', '/api/billing/invoice', '/api/cards/authorize'];
    return Array.from({ length: count }, (_, i) => {
        const svc = svcs[Math.floor(Math.random() * svcs.length)];
        const isError = Math.random() > 0.88;
        return {
            traceId: `trace-${i}-${now}`,
            spanId: `span-${i}-${now}`,
            parentSpanId: i === 0 ? null : `span-${i - 1}-${now}`,
            operationName: ops[i % ops.length],
            service: i === 0 ? 'payments-api' : svc.name,
            resource: resources[i % resources.length],
            startTime: new Date(now - i * 5000).toISOString(),
            durationMs: Math.round(10 + Math.random() * 490),
            status: isError ? 'error' : 'ok',
            tags: { http_method: 'POST', http_status: isError ? '500' : '200' },
        };
    });
}

function buildMetrics() {
    const now = Date.now();
    const series: Array<{ metric: string; tags: Record<string, string>; unit: string; points: Array<{ timestamp: string; value: number }> }> = [];
    for (const svc of FINANCIAL_SERVICES) {
        series.push({
            metric: 'request.duration',
            tags: { service: svc.name, env: 'production' },
            unit: 'ms',
            points: Array.from({ length: 12 }, (_, i) => ({
                timestamp: new Date(now - (11 - i) * 300_000).toISOString(),
                value: Math.round(svc.p50 * (0.7 + Math.random() * 0.6)),
            })),
        });
        series.push({
            metric: 'request.rate',
            tags: { service: svc.name, env: 'production' },
            unit: 'rps',
            points: Array.from({ length: 12 }, (_, i) => ({
                timestamp: new Date(now - (11 - i) * 300_000).toISOString(),
                value: Math.round(svc.baseRps * (0.85 + Math.random() * 0.3)),
            })),
        });
        series.push({
            metric: 'error.rate',
            tags: { service: svc.name, env: 'production' },
            unit: 'ratio',
            points: Array.from({ length: 12 }, (_, i) => ({
                timestamp: new Date(now - (11 - i) * 300_000).toISOString(),
                value: +(svc.baseErr * (0.5 + Math.random() * 3)).toFixed(4),
            })),
        });
    }
    return series;
}

router.get('/metrics', (_req: Request, res: Response) => {
    const snapshot = {
        services: buildServices(),
        metrics: buildMetrics(),
        traces: buildTraces(),
        errors: buildErrorEvents(),
        window: {
            start: new Date(Date.now() - 3600_000).toISOString(),
            end: new Date().toISOString(),
            granularity: '5m',
        },
        generatedAt: new Date().toISOString(),
    };
    res.json(snapshot);
});

export default router;
