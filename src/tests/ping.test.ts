import request from 'supertest';
import { app } from '../server/index';

describe('Ping routes', () => {
  it('GET /api/ping/host returns hostname', async () => {
    const response = await request(app)
      .get('/api/ping/host')
      .expect(200);
    expect(response.body).toHaveProperty('host');
  });
});