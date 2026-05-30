import { Router, type Request, type Response, type NextFunction } from 'express';

type Permission = 'read:tasks' | 'write:tasks' | 'delete:tasks' | 'read:billing' | 'write:billing' | 'admin:all';

interface Role {
    name: string;
    permissions: Permission[];
}

interface User {
    id: string;
    username: string;
    role: string;
}

const ROLES: Role[] = [
    { name: 'viewer', permissions: ['read:tasks'] },
    { name: 'member', permissions: ['read:tasks', 'write:tasks'] },
    { name: 'admin', permissions: ['read:tasks', 'write:tasks', 'delete:tasks', 'read:billing', 'write:billing'] },
    { name: 'superadmin', permissions: ['read:tasks', 'write:tasks', 'delete:tasks', 'read:billing', 'write:billing', 'admin:all'] },
];

const USERS: User[] = [
    { id: 'user-1', username: 'alice', role: 'admin' },
    { id: 'user-2', username: 'bob', role: 'member' },
    { id: 'user-3', username: 'carol', role: 'viewer' },
    { id: 'user-4', username: 'dave', role: 'superadmin' },
];

export function requirePermission(...required: Permission[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userId = req.headers['x-user-id'] as string | undefined;
        const user = USERS.find((u) => u.id === userId);
        if (!user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const role = ROLES.find((r) => r.name === user.role);
        if (!role) {
            res.status(403).json({ error: 'Role not found' });
            return;
        }
        const hasAll = required.every((perm) => role.permissions.includes(perm));
        if (!hasAll) {
            res.status(403).json({ error: `Insufficient permissions. Required: ${required.join(', ')}` });
            return;
        }
        next();
    };
}

export function requireApproval(approverRole: string = 'admin') {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const approverId = req.headers['x-approver-id'] as string | undefined;
        if (!approverId) {
            res.status(400).json({ error: 'Approval requires an approver (x-approver-id header)' });
            return;
        }
        const approver = USERS.find((u) => u.id === approverId);
        if (!approver) {
            res.status(401).json({ error: 'Approver not found' });
            return;
        }
        const role = ROLES.find((r) => r.name === approver.role);
        if (!role || !role.permissions.includes('admin:all')) {
            res.status(403).json({ error: 'Approver lacks sufficient authority for separation of duties' });
            return;
        }
        next();
    };
}

const router = Router();

router.get('/roles', (_req: Request, res: Response) => {
    res.json(ROLES.map((r) => ({ name: r.name, permissions: r.permissions })));
});

router.get('/users', requirePermission('admin:all'), (_req: Request, res: Response) => {
    res.json(USERS.map((u) => ({ id: u.id, username: u.username, role: u.role })));
});

router.post('/users', requirePermission('admin:all'), (req: Request, res: Response) => {
    const { username, role } = req.body as { username?: string; role?: string };
    if (!username || !role) {
        res.status(400).json({ error: 'username and role are required' });
        return;
    }
    if (!ROLES.find((r) => r.name === role)) {
        res.status(400).json({ error: `Invalid role. Must be one of: ${ROLES.map((r) => r.name).join(', ')}` });
        return;
    }
    const user: User = { id: `user-${USERS.length + 1}`, username, role };
    USERS.push(user);
    res.status(201).json(user);
});

export default router;
