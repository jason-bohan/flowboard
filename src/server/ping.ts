import express from 'express';

const router = express.Router();

router.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

router.get('/api/ping/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default router;