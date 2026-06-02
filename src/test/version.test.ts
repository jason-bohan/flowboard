import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('GET /api/version', () => {
  it('returns the app version as JSON with status 200', async () => {
    const res = await request(app).get('/api/version');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version');
    expect(typeof res.body.version).toBe('string');
  });
});
