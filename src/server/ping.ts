import express from 'express';

const router = express.Router();

router.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

router.get('/api/ping/time', (_req, res) => {
  res.json({ time: new Date().toISOString() });
});

export default router;