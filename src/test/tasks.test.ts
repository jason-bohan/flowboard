import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';
import db from '../server/db.js';

// Reset DB between tests so state doesn't bleed across
beforeEach(() => {
  db.exec('DELETE FROM tasks');
});

describe('Flowboard API', () => {
  // ✓ Test 1 — should pass
  it('creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Build the thing', description: 'Important work' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Build the thing',
      description: 'Important work',
      status: 'todo',
    });
    expect(typeof res.body.id).toBe('number');
    expect(typeof res.body.created_at).toBe('string');
  });

  // ✗ Test 2 — FAILS due to Bug 1 (no title validation)
  it('rejects empty title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // ✓ Test 3 — should pass
  it('lists all tasks', async () => {
    await request(app).post('/api/tasks').send({ title: 'Task A' });
    await request(app).post('/api/tasks').send({ title: 'Task B' });

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  // ✗ Test 4 — FAILS due to Bug 2 (PATCH returns pre-update snapshot)
  it('PATCH returns updated task', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Fix me', status: 'todo' });

    const id = create.body.id as number;

    const patch = await request(app)
      .patch(`/api/tasks/${id}`)
      .send({ status: 'done' });

    expect(patch.status).toBe(200);
    // Bug 2 causes this to still be 'todo' (the pre-update snapshot)
    expect(patch.body.status).toBe('done');
    expect(patch.body.id).toBe(id);
  });

  // ✗ Test 5 — FAILS due to Bug 3 (trailing space in done query)
  it('stats endpoint counts done tasks', async () => {
    await request(app)
      .post('/api/tasks')
      .send({ title: 'Completed work', status: 'done' });

    const res = await request(app).get('/api/tasks/stats');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('done');
    // Bug 3 causes done to always be 0
    expect(res.body.done).toBeGreaterThanOrEqual(1);
  });

  // ✓ Test 6 — should pass
  it('deletes a task', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({ title: 'Temporary task' });

    const id = create.body.id as number;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get('/api/tasks');
    const ids = (list.body as Array<{ id: number }>).map((t) => t.id);
    expect(ids).not.toContain(id);
  });
});
