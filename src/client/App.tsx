import { useState, useEffect, CSSProperties } from 'react';
import type { Task } from './types.js';
import { fetchTasks, createTask, updateTask, deleteTask } from './api.js';
import { FlowModeProvider, useFlowMode } from './FlowModeProvider.js';
import FlowModeSelector from './FlowModeSelector.js';
import type { FlowMode } from './flowMode.js';

const STATUSES: Task['status'][] = ['todo', 'in-progress', 'done'];

const COLUMN_LABELS: Record<Task['status'], string> = {
  todo: 'Todo',
  'in-progress': 'In Progress',
  done: 'Done',
};

const COLORS: Record<Task['status'], string> = {
  todo: '#4a9eff',
  'in-progress': '#f0a500',
  done: '#3ecf8e',
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = {
  root: (mode: FlowMode): CSSProperties => ({
    minHeight: '100vh',
    background: mode === 'planner' ? '#1a3a4a' : '#c0392b',
    color: '#e6edf3',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '0 0 48px',
  }),

  header: {
    background: '#161b22',
    borderBottom: '1px solid #30363d',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  } satisfies CSSProperties,

  logo: {
    fontSize: 22,
    fontWeight: 700,
    color: '#4a9eff',
    letterSpacing: '-0.5px',
  } satisfies CSSProperties,

  subtitle: {
    fontSize: 13,
    color: '#8b949e',
    marginLeft: 4,
  } satisfies CSSProperties,

  formBar: {
    background: '#161b22',
    borderBottom: '1px solid #30363d',
    padding: '14px 32px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  } satisfies CSSProperties,

  input: {
    flex: 1,
    maxWidth: 360,
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 6,
    color: '#e6edf3',
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
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 10,
    minWidth: 0,
  } satisfies CSSProperties,

  columnHeader: (status: Task['status']): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 16px',
    borderBottom: '1px solid #30363d',
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
    background: '#21262d',
    borderRadius: 10,
    fontSize: 12,
    color: '#8b949e',
    padding: '2px 8px',
  } satisfies CSSProperties,

  cardList: {
    padding: '12px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minHeight: 64,
  } satisfies CSSProperties,

  card: {
    background: '#0d1117',
    border: '1px solid #30363d',
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
    color: '#8b949e',
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
    border: '1px solid #30363d',
    background: '#21262d',
    color: '#e6edf3',
    cursor: 'pointer',
  } satisfies CSSProperties,

  deleteBtn: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 5,
    border: '1px solid #30363d',
    background: 'transparent',
    color: '#8b949e',
    cursor: 'pointer',
    marginLeft: 'auto',
  } satisfies CSSProperties,

  empty: {
    padding: '12px 14px',
    color: '#484f58',
    fontSize: 13,
    fontStyle: 'italic',
  } satisfies CSSProperties,
};

// ── Inner component (receives mode) ────────────────────────────────────────────

function Dashboard() {
  const { mode, loading: modeLoading } = useFlowMode();
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
    <div style={styles.root(mode)}>
      <header style={styles.header}>
        <span style={styles.logo}>Flowboard</span>
        <span style={styles.subtitle}>AI SDLC demo · Kanban</span>
        <FlowModeSelector />
      </header>

      <form style={styles.formBar} onSubmit={handleAdd}>
        <input
          style={styles.input}
          placeholder="New task title…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" style={styles.addBtn}>
          + Add Task
        </button>
        {formError && <span style={styles.errorMsg}>{formError}</span>}
      </form>

      {loading ? (
        <p style={{ padding: '32px', color: '#8b949e' }}>Loading…</p>
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
                    <div key={task.id} style={styles.card}>
                      <div style={styles.cardTitle}>{task.title}</div>
                      {task.description && (
                        <div style={styles.cardDesc}>{task.description}</div>
                      )}
                      <div style={styles.cardActions}>
                        {status !== 'done' && (
                          <button
                            style={styles.moveBtn}
                            onClick={() => handleMove(task)}
                          >
                            Move → {COLUMN_LABELS[STATUSES[STATUSES.indexOf(status) + 1]]}
                          </button>
                        )}
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(task.id)}
                        >
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

export default function App() {
  return (
    <FlowModeProvider>
      <Dashboard />
    </FlowModeProvider>
  );
}
