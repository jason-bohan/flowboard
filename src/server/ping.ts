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

router.get('/api/ping/version2', (_req, res) => {
  res.json({ v: 2 });
});

router.get('/api/ping/version2', (_req, res) => {
  res.json({ v: 2 });
});

router.get('/api/ping/version2', (_req, res) => {
  res.json({ v: 2 });
});

export default router;
