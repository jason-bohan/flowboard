import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('GET /api/ping/uptime', () => {
  it('should return uptime in seconds', async () => {
    const response = await request(app)
      .get('/api/ping/uptime')
      .expect(200);

    expect(response.body).toHaveProperty('uptime');
    expect(typeof response.body.uptime).toBe('number');
  });
});