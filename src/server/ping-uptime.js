import express from 'express';

const router = express.Router();

router.get('/uptime', (_req, res) => {
  const uptime = process.uptime();
  res.json({ uptime });
});

export default router;