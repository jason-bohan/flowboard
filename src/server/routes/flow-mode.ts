import { Router, type Request, type Response } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(__dirname, '../../flowboard.config.json');

type FlowMode = 'finance' | 'planner';
const DEFAULT_FLOW_MODE: FlowMode = 'finance';
const VALID_MODES: FlowMode[] = ['finance', 'planner'];

interface Config {
  flowMode?: FlowMode;
}

function readConfig(): Config {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Config;
  } catch {
    return {};
  }
}

function writeConfig(config: Config): void {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

const router = Router();

router.get('/flow-mode', (_req: Request, res: Response) => {
  const config = readConfig();
  res.json({ mode: config.flowMode ?? DEFAULT_FLOW_MODE });
});

router.put('/flow-mode', (req: Request, res: Response) => {
  const { mode } = req.body as { mode?: string };
  if (!mode || !(VALID_MODES as string[]).includes(mode)) {
    res.status(400).json({ error: `Invalid mode. Must be one of: finance, planner` });
    return;
  }
  const config = readConfig();
  config.flowMode = mode as FlowMode;
  writeConfig(config);
  res.json({ mode });
});

export default router;
