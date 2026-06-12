import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('GET /api/ping', () => {
  it('returns pong message', async () => {
    const res = await request(app).get('/api/ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'pong' });
  });
});

describe('GET /api/ping/pid', () => {
  it('returns the process pid', async () => {
    const res = await request(app).get('/api/ping/pid');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pid');
    expect(typeof res.body.pid).toBe('number');
  });
});
