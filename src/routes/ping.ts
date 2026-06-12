import express from 'express';

const router = express.Router();

router.get('/uptime', (_req, res) => {
  res.json({ uptimeSeconds: process.uptime() });
});

export default router;