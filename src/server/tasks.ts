import { Router, type Request, type Response } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} from './db.js';
import type { Task } from '../client/types.js';

const router = Router();

// GET /api/tasks/stats — must be registered BEFORE /api/tasks/:id
router.get('/stats', (_req: Request, res: Response) => {
  const stats = getStats();
  res.json(stats);
});

// GET /api/tasks
router.get('/', (_req: Request, res: Response) => {
  const tasks = getAllTasks();
  res.json(tasks);
});

// POST /api/tasks
router.post('/', (req: Request, res: Response) => {
  const { title = '', description = '', status = 'todo' } = req.body as Partial<Task>;

  if (!title.trim()) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const validStatuses: Task['status'][] = ['todo', 'in-progress', 'done'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }

  const task = createTask(title, description, status);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
// BUG 2: fetches task BEFORE the update then returns the pre-update snapshot
router.patch('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const existing = getTaskById(id);
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const { title, description, status } = req.body as Partial<Task>;
  const updates: Partial<Pick<Task, 'title' | 'description' | 'status'>> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (status !== undefined) updates.status = status;

  res.json(updateTask(id, updates));
});

// DELETE /api/tasks/:id
router.delete('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }

  const deleted = deleteTask(id);
  if (!deleted) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.status(204).send();
});

export default router;
