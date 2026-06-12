import express from 'express';

const router = express.Router();

router.get('/api/ping/uptime', (_req, res) => {
  res.json({ uptime: process.uptime() });
});

export default router;