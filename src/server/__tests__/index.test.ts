import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../index';

describe('GET /', () => {
  it('should respond with 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});