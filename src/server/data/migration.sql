-- Billing and ledger schema migration
-- This money path handles payments, invoicing, fee calculation, and
-- settlement reconciliation for all payment methods (ACH, wire, card).

CREATE TABLE IF NOT EXISTS billing_accounts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'reserve')),
    routing_number TEXT,
    account_number_encrypted TEXT,
    balance      REAL NOT NULL DEFAULT 0.00,
    currency     TEXT NOT NULL DEFAULT 'USD',
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL REFERENCES billing_accounts(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund', 'fee')),
    amount          REAL NOT NULL,
    fee             REAL NOT NULL DEFAULT 0.00,
    description     TEXT,
    approval_id     INTEGER REFERENCES approvals(id),
    reconciliation_id INTEGER REFERENCES reconciliations(id),
    recorded_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approvals (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    approver_id TEXT NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('admin', 'superadmin', 'compliance')),
    approved_at TEXT NOT NULL DEFAULT (datetime('now')),
    evidence    TEXT
);

CREATE TABLE IF NOT EXISTS reconciliations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id      INTEGER NOT NULL REFERENCES billing_accounts(id),
    expected_balance REAL NOT NULL,
    actual_balance   REAL NOT NULL,
    variance         REAL NOT NULL DEFAULT 0.00,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'investigating', 'resolved')),
    audit_log       TEXT,
    reconciled_by   TEXT,
    reconciled_at   TEXT
);

-- Index for audit traceability
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reconciliation ON transactions(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON reconciliations(status);
