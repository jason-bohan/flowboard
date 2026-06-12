import { useState, useEffect, type CSSProperties } from 'react';
import type { Task } from './types.js';
import { updateTask } from './api.js';

const STATUS_OPTIONS: { value: Task['status']; label: string }[] = [
  { value: 'todo', label: 'Backlog' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Completed' },
];

const STATUS_LABEL: Record<Task['status'], string> = {
  todo: 'Backlog',
  'in-progress': 'In Progress',
  done: 'Completed',
};

const PALETTE = {
  bg: 'red',
  card: '#15232e',
  border: '#1e3a4d',
  accent: '#2a9fd6',
  text: '#e0f0ff',
  muted: '#7a9bb5',
};

const WIDTH = 400;

const styles = {
  backdrop: (open: boolean): CSSProperties => ({
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.45)',
    opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none',
    transition: 'opacity 0.25s ease',
    zIndex: 40,
  }),
  panel: (open: boolean): CSSProperties => ({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: WIDTH,
    maxWidth: '100vw',
    background: PALETTE.card,
    borderLeft: `1px solid ${PALETTE.border}`,
    boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.35)',
    color: PALETTE.text,
    transform: open ? 'translateX(0)' : 'translateX(100%)',
    transition: 'transform 0.25s ease',
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '16px 18px',
    borderBottom: `1px solid ${PALETTE.border}`,
  } satisfies CSSProperties,
  headerLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: PALETTE.muted,
  } satisfies CSSProperties,
  closeBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: 'none',
    color: PALETTE.muted,
    fontSize: 22,
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0 4px',
  } satisfies CSSProperties,
  body: {
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    overflowY: 'auto',
  } satisfies CSSProperties,
  fieldLabel: {
    fontSize: 12,
    color: PALETTE.muted,
    marginBottom: 6,
  } satisfies CSSProperties,
  titleText: {
    fontSize: 20,
    fontWeight: 700,
    cursor: 'text',
    wordBreak: 'break-word',
  } satisfies CSSProperties,
  descText: {
    fontSize: 14,
    lineHeight: 1.5,
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    color: PALETTE.text,
    minHeight: 20,
  } satisfies CSSProperties,
  descPlaceholder: {
    fontSize: 14,
    fontStyle: 'italic',
    cursor: 'text',
    color: PALETTE.muted,
  } satisfies CSSProperties,
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 6,
    color: PALETTE.text,
    padding: '8px 10px',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  } satisfies CSSProperties,
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 6,
    color: PALETTE.text,
    padding: '8px 10px',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: 80,
  } satisfies CSSProperties,
  select: {
    background: PALETTE.bg,
    border: `1px solid ${PALETTE.border}`,
    borderRadius: 6,
    color: PALETTE.text,
    padding: '8px 10px',
    fontSize: 14,
    outline: 'none',
    cursor: 'pointer',
  } satisfies CSSProperties,
  badge: (status: Task['status']): CSSProperties => ({
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 10,
    background: status === 'done' ? '#3ecf8e' : status === 'in-progress' ? '#f0a500' : PALETTE.accent,
    color: '#0b1620',
  }),
  meta: {
    fontSize: 12,
    color: PALETTE.muted,
  } satisfies CSSProperties,
};

interface Props {
  task: Task | null;
  onClose: () => void;
  onUpdated: (task: Task) => void;
}

export default function TaskDetailSidesheet({ task, onClose, onUpdated }: Props) {
  const open = task !== null;
  // Retain the last task so the slide-out animation still shows content.
  const [shown, setShown] = useState<Task | null>(task);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  useEffect(() => {
    if (task) {
      setShown(task);
      setTitle(task.title);
      setDescription(task.description);
      setEditingTitle(false);
      setEditingDesc(false);
    }
  }, [task]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function persist(updates: Partial<Pick<Task, 'title' | 'description' | 'status'>>) {
    if (!shown) return;
    try {
      const updated = await updateTask(shown.id, updates);
      onUpdated(updated);
    } catch (err) {
      console.error('Update failed', err);
    }
  }

  async function commitTitle() {
    setEditingTitle(false);
    const next = title.trim();
    if (!shown) return;
    if (next && next !== shown.title) await persist({ title: next });
    else setTitle(shown.title);
  }

  async function commitDescription() {
    setEditingDesc(false);
    if (!shown) return;
    if (description !== shown.description) await persist({ description });
  }

  const status = shown?.status ?? 'todo';

  return (
    <>
      <div style={styles.backdrop(open)} onClick={onClose} />
      <aside style={styles.panel(open)} role="dialog" aria-label="Task details" aria-hidden={!open}>
        <div style={styles.header}>
          <span style={styles.headerLabel}>Task details</span>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {shown && (
          <div style={styles.body}>
            <div>
              <div style={styles.fieldLabel}>Title</div>
              {editingTitle ? (
                <input
                  style={styles.input}
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitTitle();
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setTitle(shown.title);
                      setEditingTitle(false);
                    }
                  }}
                />
              ) : (
                <div style={styles.titleText} onClick={() => setEditingTitle(true)} title="Click to edit">
                  {shown.title}
                </div>
              )}
            </div>

            <div>
              <div style={styles.fieldLabel}>Description</div>
              {editingDesc ? (
                <textarea
                  style={styles.textarea}
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={commitDescription}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setDescription(shown.description);
                      setEditingDesc(false);
                    }
                  }}
                />
              ) : shown.description ? (
                <div style={styles.descText} onClick={() => setEditingDesc(true)} title="Click to edit">
                  {shown.description}
                </div>
              ) : (
                <div style={styles.descPlaceholder} onClick={() => setEditingDesc(true)}>
                  Add a description…
                </div>
              )}
            </div>

            <div>
              <div style={styles.fieldLabel}>Status</div>
              <select
                style={styles.select}
                value={status}
                onChange={(e) => persist({ status: e.target.value as Task['status'] })}
                aria-label="Status"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span style={{ marginLeft: 10 }}>
                <span style={styles.badge(status)}>{STATUS_LABEL[status]}</span>
              </span>
            </div>

            <div>
              <div style={styles.fieldLabel}>Created</div>
              <div style={styles.meta}>{new Date(shown.created_at).toLocaleString()}</div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
