import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import tasksRouter from './tasks.js';
import billingRouter from './billing.js';
import ledgerRouter from './ledger.js';
import authRouter from './auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);
app.use('/api/billing', billingRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/auth', authRouter);

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

export { app };
