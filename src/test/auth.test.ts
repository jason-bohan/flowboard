import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/index.js';

describe('Auth API — RBAC, permissions, and approval controls', () => {
    it('returns role list', async () => {
        const res = await request(app).get('/api/auth/roles');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const roles = res.body.map((r: { name: string }) => r.name);
        expect(roles).toContain('viewer');
        expect(roles).toContain('member');
        expect(roles).toContain('admin');
        expect(roles).toContain('superadmin');
    });

    it('rejects unauthenticated user list access', async () => {
        const res = await request(app).get('/api/auth/users');

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Authentication required');
    });

    it('allows superadmin to list users (separation of duties)', async () => {
        const res = await request(app)
            .get('/api/auth/users')
            .set('x-user-id', 'user-4');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('creates a new user with admin approval', async () => {
        const res = await request(app)
            .post('/api/auth/users')
            .set('x-user-id', 'user-4')
            .send({ username: 'eve', role: 'viewer' });

        expect(res.status).toBe(201);
        expect(res.body.username).toBe('eve');
        expect(res.body.role).toBe('viewer');
    });

    it('rejects user creation with invalid role', async () => {
        const res = await request(app)
            .post('/api/auth/users')
            .set('x-user-id', 'user-4')
            .send({ username: 'frank', role: 'superuser' });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid role');
    });
});
