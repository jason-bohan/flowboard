import express from 'express';

const router = express.Router();

router.get('/api/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

router.get('/api/ping/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/api/ping/echo', (_req, res) => {
  const msg = _req.query.msg || null;
  res.json({ echo: msg });
});

export default router;
