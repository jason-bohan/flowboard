import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStats } from './types.js';

const BASE = '/api/tasks';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(BASE);
  return handleResponse<Task[]>(res);
}

export async function fetchStats(): Promise<TaskStats> {
  const res = await fetch(`${BASE}/stats`);
  return handleResponse<TaskStats>(res);
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Task>(res);
}

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}

// ── Financial API ───────────────────────────────────────────────────────────────

export async function fetchBalance(): Promise<{ currentBalance: number; asOf: string }> {
  const res = await fetch('/api/ledger/balance');
  return handleResponse(res);
}

export async function fetchLedger(): Promise<any[]> {
  const res = await fetch('/api/ledger');
  return handleResponse(res);
}

export async function fetchCards(): Promise<any[]> {
  const res = await fetch('/api/cards');
  return handleResponse(res);
}

export async function lockCard(id: number): Promise<any> {
  const res = await fetch(`/api/cards/${id}/lock`, { method: 'POST' });
  return handleResponse(res);
}

export async function unlockCard(id: number): Promise<any> {
  const res = await fetch(`/api/cards/${id}/unlock`, { method: 'POST' });
  return handleResponse(res);
}

export async function fetchTransfers(): Promise<any[]> {
  const res = await fetch('/api/payments/transfers');
  return handleResponse(res);
}

export async function createTransfer(payload: any): Promise<any> {
  const res = await fetch('/api/payments/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function fetchBillPayees(): Promise<any[]> {
  const res = await fetch('/api/payments/bill-payees');
  return handleResponse(res);
}

export async function payBill(id: number, amount: number): Promise<any> {
  const res = await fetch(`/api/payments/bill-payees/${id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  return handleResponse(res);
}

export async function submitMobileDeposit(amount: number, depositMethod?: string): Promise<any> {
  const res = await fetch('/api/cards/mobile-deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, depositMethod }),
  });
  return handleResponse(res);
}

export async function fetchInvoices(): Promise<any[]> {
  const res = await fetch('/api/billing');
  return handleResponse(res);
}
