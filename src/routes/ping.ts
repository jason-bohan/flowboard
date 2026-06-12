import { Router } from 'express';

const router = Router();

router.get('/api/ping/uptime', (req, res) => {
  res.json({ uptimeSeconds: process.uptime() });
});

export default router;