// src/server/ledger/index.ts
import express from 'express';
import { getLedgerSummary } from './summary.js';

const ledgerRouter = express.Router();

ledgerRouter.get('/summary', getLedgerSummary);

export default ledgerRouter;