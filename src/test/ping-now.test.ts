import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('GET /api/ping/now', () => {
  it('returns current timestamp', async () => {
    const res = await request(app).get('/api/ping/now');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('now');
    expect(typeof res.body.now).toBe('number');
  });
});
