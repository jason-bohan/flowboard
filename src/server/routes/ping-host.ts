import { Router } from 'express';

const router = Router();

router.get('/host', (_req, res) => {
  res.json({ host: 'localhost' });
});

export default router;
