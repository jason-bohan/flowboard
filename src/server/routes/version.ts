import { Router, type Request, type Response } from 'express';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../../package.json'), 'utf-8')) as { version: string };

const router = Router();

router.get('/version', (_req: Request, res: Response) => {
  res.json({ version: pkg.version });
});

export default router;
