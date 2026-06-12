import express from 'express';
import { readFileSync } from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import tasksRouter from './tasks.js';
import billingRouter from './billing.js';
import ledgerRouter from './ledger.js';
import authRouter from './auth.js';
import studentLoansRouter from './student-loans.js';
import cardServicesRouter from './card-services.js';
import paymentsRouter from './payments.js';
import telemetryRouter from './telemetry.js';
import flowModeRouter from './routes/flow-mode.js';
import pingRouter from './ping.js';
import pingTimeRouter from './routes/ping.js';
import pingUptimeRouter from './ping-uptime.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/billing', billingRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/auth', authRouter);
app.use('/api/student-loans', studentLoansRouter);
app.use('/api/cards', cardServicesRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api', flowModeRouter);
app.use(pingRouter);
app.use(pingTimeRouter);
app.use('/api/ping', pingUptimeRouter);

app.get('/api/version', (_req, res) => {
  const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));
  res.json({ version: pkg.version, name: pkg.name });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'flowboard' });
});

// Serve built React client in production
const clientDist = resolve(__dirname, '../client');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(resolve(clientDist, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT ?? 3000);
  app.listen(PORT, () => {
    console.log(`Flowboard API listening on http://localhost:${PORT}`);
  });
}

app.get('/api/ready', (_req, res) => {
  res.json({ ready: true });
});

app.get('/api/task-pickup', (_req, res) => {
  res.json({ message: 'Task pickup initiated' });
});

app.get('/api/test-issue', (_req, res) => {
  res.json({ message: 'Test issue endpoint' });
});

export { app };
