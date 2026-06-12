import { Router } from 'express';

const router = Router();

router.get('/api/ping/time', (_req, res) => {
  res.json({ iso: new Date().toISOString() });
});

export default router;