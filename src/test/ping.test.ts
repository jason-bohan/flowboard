import request from 'supertest';
import app from '../../src/server';
import { describe, it, expect } from '@jest/globals';

describe('GET /api/ping/version2', () => {
  it('should return { v: 2 }', async () => {
    const response = await request(app).get('/api/ping/version2');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ v: 2 });
  });
});
