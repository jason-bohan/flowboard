import { useState, useEffect, type CSSProperties } from 'react';
import type { Task } from './types.js';
import { fetchTasks, createTask, updateTask, deleteTask } from './api.js';
import FlowModeSelector from './FlowModeSelector.js';

const STATUSES: Task['status'][] = ['todo', 'in-progress', 'done'];

const COLUMN_LABELS: Record<Task['status'], string> = {
  todo: 'Backlog',
  'in-progress': 'In Progress',
  done: 'Completed',
};

const PALETTE = {
  bg: '#0f1923',
  card: '#15232e',
  border: '#1e3a4d',
  accent: '#2a9fd6',
  text: '#e0f0ff',
  muted: '#7a9bb5',
};

const COLORS: Record<Task['status'], string> = {
  todo: PALETTE.accent,
  'in-progress': '#f0a500',
  done: '#3ecf8e',
};

const styles = {
  root: {
    minHeight: '100vh',
    background: PALETTE.bg,
    color: PALETTE.text,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '0 0 48px',
  } satisfies CSSProperties,
  header: {
    background: PALETTE.card,
    borderBottom: `1px solid ${PALETTE.border}`,
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } satisfies CSSProperties,
  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: PALETTE.accent,
    letterSpacing: '-0.5px',
  } satisfies CSSProperties,
  subtitle: {
    fontSize: 13,
    color: PALETTE.muted,
    marginLeft: 4,
  } satisfies CSSProperties,
  formBar: {
    background: PALETTE.card,
    borderBottom: `1px solid ${PALETTE.border}`,
    padding: '14px 32px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  } satisfies CSSProperties,
  input: {
    flex: 1,
    maxWidth: 360,
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 6,
    color: PALETTE.text,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
  } satisfies CSSProperties,
  addBtn: {
    background: '#238636',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    padding: '8px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  } satisfies CSSProperties,
  errorMsg: {
    color: '#f85149',
    fontSize: 13,
    marginLeft: 8,
  } satisfies CSSProperties,
  board: {
    display: 'flex',
    gap: 20,
    padding: '28px 32px',
    alignItems: 'flex-start',
  } satisfies CSSProperties,
  column: {
    flex: 1,
    background: PALETTE.card,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 10,
    minWidth: 0,
  } satisfies CSSProperties,
  columnHeader: (status: Task['status']): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 16px',
    borderBottom: `1px solid ${PALETTE.border}`,
  }),
  columnDot: (status: Task['status']): CSSProperties => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: COLORS[status],
    flexShrink: 0,
  }),
  columnTitle: {
    fontWeight: 600,
    fontSize: 14,
  } satisfies CSSProperties,
  columnCount: {
    marginLeft: 'auto',
    background: PALETTE.bg,
    borderRadius: 10,
    fontSize: 12,
    color: PALETTE.muted,
    padding: '2px 8px',
  } satisfies CSSProperties,
  cardList: {
    padding: '12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minHeight: 64,
  } satisfies CSSProperties,
  taskCard: {
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 8,
    padding: '12px 14px',
  } satisfies CSSProperties,
  cardTitle: {
    fontWeight: 600,
    fontSize: 14,
    marginBottom: 4,
    wordBreak: 'break-word',
  } satisfies CSSProperties,
  cardDesc: {
    fontSize: 12,
    color: PALETTE.muted,
    marginBottom: 10,
    wordBreak: 'break-word',
    lineHeight: 1.5,
  } satisfies CSSProperties,
  cardActions: {
    display: 'flex',
    gap: 8,
  } satisfies CSSProperties,
  moveBtn: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 5,
    border: `1px solid ${PALETTE.border}`,
    background: PALETTE.card,
    color: PALETTE.text,
    cursor: 'pointer',
  } satisfies CSSProperties,
  deleteBtn: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 5,
    border: `1px solid ${PALETTE.border}`,
    background: 'transparent',
    color: PALETTE.muted,
    cursor: 'pointer',
    marginLeft: 'auto',
  } satisfies CSSProperties,
  empty: {
    padding: '12px 14px',
    color: PALETTE.muted,
    fontSize: 13,
    fontStyle: 'italic',
  } satisfies CSSProperties,
};

export default function PlannerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setFormError('Title is required');
      return;
    }
    setFormError('');
    try {
      const task = await createTask({ title: trimmed });
      setTasks((prev) => [...prev, task]);
      setNewTitle('');
    } catch (err) {
      setFormError(String(err));
    }
  }

  async function handleMove(task: Task) {
    const nextIndex = (STATUSES.indexOf(task.status) + 1) % STATUSES.length;
    const nextStatus = STATUSES[nextIndex];
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error('Move failed', err);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  }

  const byStatus = (status: Task['status']) => tasks.filter((t) => t.status === status);

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>Flowboard</span>
        <span style={styles.subtitle}>AI SDLC demo · Planner</span>
        <FlowModeSelector />
      </header>

      <form style={styles.formBar} onSubmit={handleAdd}>
        <input
          style={styles.input}
          placeholder="New task title…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" style={styles.addBtn}>+ Add Task</button>
        {formError && <span style={styles.errorMsg}>{formError}</span>}
      </form>

      {loading ? (
        <p style={{ padding: '32px', color: PALETTE.muted }}>Loading…</p>
      ) : (
        <div style={styles.board}>
          {STATUSES.map((status) => {
            const colTasks = byStatus(status);
            return (
              <div key={status} style={styles.column}>
                <div style={styles.columnHeader(status)}>
                  <div style={styles.columnDot(status)} />
                  <span style={styles.columnTitle}>{COLUMN_LABELS[status]}</span>
                  <span style={styles.columnCount}>{colTasks.length}</span>
                </div>
                <div style={styles.cardList}>
                  {colTasks.length === 0 && (
                    <div style={styles.empty}>No tasks here</div>
                  )}
                  {colTasks.map((task) => (
                    <div key={task.id} style={styles.taskCard}>
                      <div style={styles.cardTitle}>{task.title}</div>
                      {task.description && (
                        <div style={styles.cardDesc}>{task.description}</div>
                      )}
                      <div style={styles.cardActions}>
                        {status !== 'done' && (
                          <button style={styles.moveBtn} onClick={() => handleMove(task)}>
                            Move → {COLUMN_LABELS[STATUSES[STATUSES.indexOf(status) + 1]]}
                          </button>
                        )}
                        <button style={styles.deleteBtn} onClick={() => handleDelete(task.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
