import express from 'express';

const router = express.Router();

router.get('/memory', (_req, res) => {
  res.json({ rss: process.memoryUsage().rss });
});

export default router;