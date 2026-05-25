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
