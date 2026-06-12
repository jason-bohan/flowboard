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

router.get('/api/ping/now', (_req, res) => {
  res.json({ now: Date.now() });
});

router.get('/api/ping/version2', (_req, res) => {
  res.json({ v: 2 });
});

router.get('/api/ping/pid', (_req, res) => {
  res.json({ pid: process.pid });
});

router.get('/api/ping/time', (_req, res) => {
  res.json({ iso: new Date().toISOString() });
});

export default router;
