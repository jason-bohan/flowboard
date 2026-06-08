import express from 'express';

const router = express.Router();

router.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

router.get('/api/ping/uptime', (_req, res) => {
  res.json({ uptime: process.uptime() });
});

router.get('/api/ping/uptime', (_req, res) => {
  res.json({ uptime: process.uptime() });
});

export default router;