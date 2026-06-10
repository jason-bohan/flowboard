import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('GET /api/ping/version2', () => {
  it('returns version 2 payload', async () => {
    const res = await request(app).get('/api/ping/version2');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ v: 2 });
  });
});
