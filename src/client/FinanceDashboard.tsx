import { useState, useEffect, type CSSProperties, type FormEvent } from 'react';
import {
  fetchBalance, fetchCards, fetchTransfers, fetchBillPayees,
  fetchInvoices, lockCard, unlockCard, createTransfer,
  payBill, submitMobileDeposit,
} from './api.js';
import FlowModeSelector from './FlowModeSelector.js';

type PanelId = 'transfer' | 'pay-bill' | 'deposit' | null;

// ── Helpers ─────────────────────────────────────────────────────────────────────

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLORS = {
  bg: '#22c55e',
  card: '#111827',
  border: '#1f2937',
  accent: '#cc0000',
  accentHover: '#e60000',
  text: '#f3f4f6',
  muted: '#9ca3af',
  green: '#10b981',
  gold: '#f59e0b',
};

const s = {
  page: {
    minHeight: '100vh',
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '0 0 48px',
  } satisfies CSSProperties,
  header: {
    background: COLORS.card,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } satisfies CSSProperties,
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.accent,
    letterSpacing: '-0.5px',
  } satisfies CSSProperties,
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
  } satisfies CSSProperties,
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '24px 32px',
  } satisfies CSSProperties,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 14,
    color: COLORS.text,
  } satisfies CSSProperties,
  row: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
    marginBottom: 28,
  } satisfies CSSProperties,
  accountCard: {
    flex: '1 1 220px',
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: '20px 22px',
  } satisfies CSSProperties,
  accountLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  } satisfies CSSProperties,
  accountBalance: {
    fontSize: 28,
    fontWeight: 700,
  } satisfies CSSProperties,
  accountSub: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 6,
  } satisfies CSSProperties,
  quickActions: {
    display: 'flex',
    gap: 12,
    marginBottom: 28,
    flexWrap: 'wrap' as const,
  } satisfies CSSProperties,
  actionBtn: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: '14px 24px',
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.15s',
  } satisfies CSSProperties,
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 28,
  } satisfies CSSProperties,
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: '20px 22px',
  } satisfies CSSProperties,
  cardItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: `1px solid ${COLORS.border}`,
  } satisfies CSSProperties,
  cardLabel: {
    fontSize: 13,
    color: COLORS.muted,
  } satisfies CSSProperties,
  cardValue: {
    fontSize: 14,
    fontWeight: 600,
  } satisfies CSSProperties,
  smallBtn: (color: string): CSSProperties => ({
    background: 'transparent',
    border: `1px solid ${color}`,
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    color,
    cursor: 'pointer',
  }),
  chip: (bg: string): CSSProperties => ({
    background: bg + '22',
    color: bg,
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 4,
  }),
  // Modal / form overlay
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  } satisfies CSSProperties,
  modal: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: 28,
    width: '100%',
    maxWidth: 440,
  } satisfies CSSProperties,
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
  } satisfies CSSProperties,
  input: {
    width: '100%',
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    color: COLORS.text,
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    marginBottom: 12,
    boxSizing: 'border-box' as const,
  } satisfies CSSProperties,
  submitBtn: {
    background: COLORS.accent,
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: 4,
  } satisfies CSSProperties,
  closeBtn: {
    background: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    color: COLORS.muted,
    padding: '8px 16px',
    fontSize: 13,
    cursor: 'pointer',
    marginRight: 8,
  } satisfies CSSProperties,
  modalActions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 16,
  } satisfies CSSProperties,
  successMsg: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: 600,
    padding: '10px 0',
  } satisfies CSSProperties,
  errorMsg: {
    color: COLORS.accent,
    fontSize: 13,
  } satisfies CSSProperties,
  txRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: 13,
  } satisfies CSSProperties,
  txDesc: {
    color: COLORS.text,
  } satisfies CSSProperties,
  txAmount: (positive: boolean): CSSProperties => ({
    fontWeight: 600,
    color: positive ? COLORS.green : COLORS.text,
  }),
  txDate: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  } satisfies CSSProperties,
};

// ── Component ───────────────────────────────────────────────────────────────────

export default function FinanceDashboard() {
  const [balance, setBalance] = useState(0);
  const [asOf, setAsOf] = useState('');
  const [cards, setCards] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [billPayees, setBillPayees] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchBalance().then(d => { setBalance(d.currentBalance); setAsOf(d.asOf); }),
      fetchCards().then(setCards),
      fetchTransfers().then(setTransfers),
      fetchBillPayees().then(setBillPayees),
      fetchInvoices().then(setInvoices),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setError('');
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  // ── Quick action handlers ─────────────────────────────────────────────────────

  async function handleTransfer(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    try {
      const t = await createTransfer({
        fromAccount: fd.get('from') || 'Checking (*4567)',
        toAccount: fd.get('to'),
        amount: Number(fd.get('amount')),
      });
      setTransfers(prev => [t, ...prev]);
      showSuccess(`Transfer of ${fmt(t.amount)} to ${t.toAccount} submitted`);
      setActivePanel(null);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handlePayBill(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const payeeId = Number(fd.get('payeeId'));
    const amount = Number(fd.get('amount'));
    try {
      const result = await payBill(payeeId, amount);
      showSuccess(result.message);
      setActivePanel(null);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleDeposit(e: FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    try {
      const result = await submitMobileDeposit(Number(fd.get('amount')), fd.get('method') as string || undefined);
      showSuccess(result.message);
      setActivePanel(null);
    } catch (err) {
      setError(String(err));
    }
  }

  async function handleLock(card: any) {
    try {
      const result = card.status === 'locked' ? await unlockCard(card.id) : await lockCard(card.id);
      const updated = result.card ?? result;
      setCards(prev => prev.map(c => c.id === updated.id ? updated : c));
      showSuccess(result.message);
    } catch (err) {
      setError(String(err));
    }
  }

  // ── Modal panels ──────────────────────────────────────────────────────────────

  function renderPanel() {
    if (!activePanel) return null;
    const title = { transfer: 'Transfer Money', 'pay-bill': 'Pay a Bill', deposit: 'Mobile Deposit' }[activePanel];

    const form = activePanel === 'transfer' ? (
      <form onSubmit={handleTransfer}>
        <input name="from" style={s.input} placeholder="From (e.g. Checking (*4567))" defaultValue="Checking (*4567)" />
        <input name="to" style={s.input} placeholder="To account or person" required />
        <input name="amount" type="number" step="0.01" min="0.01" style={s.input} placeholder="Amount" required />
        {error && <div style={s.errorMsg}>{error}</div>}
        <button type="submit" style={s.submitBtn}>Send Transfer</button>
      </form>
    ) : activePanel === 'pay-bill' ? (
      <form onSubmit={handlePayBill}>
        <select name="payeeId" style={s.input} required>
          <option value="">Select payee…</option>
          {billPayees.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input name="amount" type="number" step="0.01" min="0.01" style={s.input} placeholder="Amount" required />
        {error && <div style={s.errorMsg}>{error}</div>}
        <button type="submit" style={s.submitBtn}>Schedule Payment</button>
      </form>
    ) : (
      <form onSubmit={handleDeposit}>
        <input name="amount" type="number" step="0.01" min="0.01" style={s.input} placeholder="Check amount" required />
        <select name="method" style={s.input}>
          <option value="standard">Standard (next business day)</option>
          <option value="immediate">Immediate (2% fee)</option>
        </select>
        {error && <div style={s.errorMsg}>{error}</div>}
        <button type="submit" style={s.submitBtn}>Submit Deposit</button>
      </form>
    );

    return (
      <div style={s.overlay} onClick={() => setActivePanel(null)}>
        <div style={s.modal} onClick={e => e.stopPropagation()}>
          <div style={s.modalTitle}>{title}</div>
          {form}
          <div style={s.modalActions}>
            <button style={s.closeBtn} onClick={() => setActivePanel(null)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={s.page}>
        <header style={s.header}>
          <span style={s.logo}>Flowboard</span>
          <span style={s.subtitle}>AI SDLC demo · Finance</span>
          <FlowModeSelector />
        </header>
        <div style={{ padding: 32, color: COLORS.muted }}>Loading your accounts…</div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <span style={s.logo}>Flowboard</span>
        <span style={s.subtitle}>AI SDLC demo · Finance</span>
        <FlowModeSelector />
      </header>

      <div style={s.container}>
        {/* Success banner */}
        {successMsg && <div style={{ ...s.successMsg, marginBottom: 16 }}>{successMsg}</div>}

        {/* Account summary row */}
        <div style={s.sectionTitle}>Accounts</div>
        <div style={s.row}>
          <div style={s.accountCard}>
            <div style={s.accountLabel}>Checking</div>
            <div style={{ ...s.accountBalance, color: COLORS.text }}>{fmt(balance)}</div>
            <div style={s.accountSub}>Account ending in 4567</div>
          </div>
          <div style={s.accountCard}>
            <div style={s.accountLabel}>Savings</div>
            <div style={{ ...s.accountBalance, color: COLORS.gold }}>{fmt(Math.round(balance * 0.35 * 100) / 100)}</div>
            <div style={s.accountSub}>Account ending in 7890</div>
          </div>
          <div style={s.accountCard}>
            <div style={s.accountLabel}>Credit Card</div>
            <div style={{ ...s.accountBalance, color: COLORS.accent }}>-{fmt(Math.round(balance * 0.08 * 100) / 100)}</div>
            <div style={s.accountSub}>Visa ending in 4521 · Due Jun 15</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={s.sectionTitle}>Quick Actions</div>
        <div style={s.quickActions}>
          <button style={s.actionBtn} onClick={() => { setError(''); setActivePanel('transfer'); }}>
            <span>⬆</span> Transfer
          </button>
          <button style={s.actionBtn} onClick={() => { setError(''); setActivePanel('pay-bill'); }}>
            <span>📄</span> Pay Bills
          </button>
          <button style={s.actionBtn} onClick={() => { setError(''); setActivePanel('deposit'); }}>
            <span>📷</span> Deposit
          </button>
        </div>

        {/* Cards */}
        <div style={s.sectionTitle}>Debit Cards</div>
        <div style={{ ...s.row, marginBottom: 28 }}>
          {cards.slice(0, 2).map((card: any) => (
            <div key={card.id} style={s.accountCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, color: COLORS.text }}>
                  {card.cardNetwork}
                </span>
                <span style={s.chip(card.status === 'active' ? COLORS.green : COLORS.muted)}>
                  {card.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 4 }}>•••• {card.cardLastFour}</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>
                Expires {card.expirationDate} · {card.cardHolder}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={s.smallBtn(card.status === 'locked' ? COLORS.green : COLORS.gold)} onClick={() => handleLock(card)}>
                  {card.status === 'locked' ? 'Unlock' : 'Lock'}
                </button>
                <span style={{ fontSize: 11, color: COLORS.muted, alignSelf: 'center' }}>
                  Daily limit: {fmt(card.dailyLimit)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Two-column: Invoices + Recent Transfers */}
        <div style={s.grid2}>
          {/* Invoices */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Invoices</div>
            {invoices.length === 0 && <div style={{ color: COLORS.muted, fontSize: 13 }}>No invoices</div>}
            {invoices.slice(0, 4).map((inv: any) => (
              <div key={inv.id} style={s.cardItem}>
                <div>
                  <div style={s.cardValue}>{inv.clientName}</div>
                  <div style={s.cardLabel}>{inv.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={s.cardValue}>{fmt(inv.amount)}</div>
                  <span style={s.chip(inv.status === 'paid' ? COLORS.green : inv.status === 'overdue' ? COLORS.accent : COLORS.muted)}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Transfers */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Recent Transfers</div>
            {transfers.length === 0 && <div style={{ color: COLORS.muted, fontSize: 13 }}>No transfers</div>}
            {transfers.slice(0, 5).map((tx: any) => (
              <div key={tx.id} style={s.txRow}>
                <div>
                  <div style={s.txDesc}>{tx.toAccount}</div>
                  <div style={s.txDate}>{new Date(tx.createdAt).toLocaleDateString()} · {tx.method}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={s.txAmount(false)}>-{fmt(tx.amount)}</div>
                  <span style={s.chip(tx.status === 'completed' ? COLORS.green : tx.status === 'pending' ? COLORS.gold : COLORS.muted)}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {renderPanel()}
    </div>
  );
}
