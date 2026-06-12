import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';

describe('GET /api/ping/time', () => {
  it('should return the current time in ISO format', async () => {
    const response = await request(app)
      .get('/api/ping/time')
      .expect(200);

    expect(response.body).toHaveProperty('iso');
    expect(new Date(response.body.iso).toISOString()).toBe(response.body.iso);
  });
});
