import { createRequire } from 'node:module';
import type { Task } from '../client/types.js';

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');

const db = new DatabaseSync(
  process.env.NODE_ENV === 'test' ? ':memory:' : './flowboard.db'
);

// Initialize schema on import
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'todo',
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);

export function getAllTasks(): Task[] {
  return db.prepare('SELECT * FROM tasks ORDER BY id ASC').all() as unknown as Task[];
}

export function getTaskById(id: number): Task | undefined {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
}

export function createTask(
  title: string,
  description: string,
  status: Task['status']
): Task {
  const stmt = db.prepare(
    'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)'
  );
  const result = stmt.run(title, description, status);
  return getTaskById(Number(result.lastInsertRowid))!;
}

export function updateTask(
  id: number,
  updates: Partial<Pick<Task, 'title' | 'description' | 'status'>>
): Task | undefined {
  const fields = Object.keys(updates)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = Object.values(updates);
  if (fields.length === 0) return getTaskById(id);
  db.prepare(`UPDATE tasks SET ${fields} WHERE id = ?`).run(...values, id);
  return getTaskById(id);
}

export function deleteTask(id: number): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return (result.changes as number) > 0;
}

export function getStats(): { todo: number; inProgress: number; done: number } {
  const todo = (
    db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'todo'").get() as {
      count: number;
    }
  ).count;
  const inProgress = (
    db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'in-progress'")
      .get() as { count: number }
  ).count;
  const done = (
    db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'done'")
      .get() as { count: number }
  ).count;
  return { todo, inProgress, done };
}

export default db;
