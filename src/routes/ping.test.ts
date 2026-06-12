import request from 'supertest';
import { app } from '../server/index.js';

describe('Ping routes', () => {
  it('GET /api/ping/uptime returns uptime in seconds', async () => {
    const response = await request(app)
      .get('/api/ping/uptime')
      .expect(200);

    expect(response.body).toHaveProperty('uptimeSeconds');
    expect(typeof response.body.uptimeSeconds).toBe('number');
  });
});