import express from 'express';
import cors from 'cors';
import tasksRouter from './tasks.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/tasks', tasksRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'flowboard' });
});

// Only start listening when run directly (not imported by tests)
if (process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT ?? 3000);
  app.listen(PORT, () => {
    console.log(`Flowboard API listening on http://localhost:${PORT}`);
  });
}

export { app };
