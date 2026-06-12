import request from 'supertest';
import { app } from '../../src/server/index.js';

describe('GET /api/ping/memory', () => {
  it('should return memory usage', async () => {
    const response = await request(app)
      .get('/api/ping/memory')
      .expect(200);

    expect(response.body).toHaveProperty('rss');
    expect(typeof response.body.rss).toBe('number');
  });
});