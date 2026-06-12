import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('GET /api/ping/time', () => {
  it('returns ISO timestamp', async () => {
    const res = await request(app).get('/api/ping/time');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('iso');
    expect(typeof res.body.iso).toBe('string');
    // Check it's a valid ISO string
    expect(() => new Date(res.body.iso)).not.toThrow();
  });
});