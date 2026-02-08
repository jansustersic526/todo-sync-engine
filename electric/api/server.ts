import express, { Request, Response } from 'express';
import cors from 'cors';
import pg from 'pg';
import http from 'http';

const { Pool } = pg;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ELECTRIC_URL = process.env.ELECTRIC_URL || 'http://localhost:3000';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
});

app.post('/todos', async (req: Request, res: Response) => {
  const { id, title } = req.body as { id: string; title: string };
  try {
    await delay(1000);
    await pool.query('INSERT INTO todos (id, title) VALUES ($1, $2)', [id, title]);
    res.status(201).json({ id, title });
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    await delay(1000);
    await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.get('/v1/shape', async (req: Request, res: Response) => {
  await delay(1000);
  const url = new URL(`${ELECTRIC_URL}/v1/shape`);
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      url.searchParams.set(key, value);
    }
  }

  const proxyReq = http.get(
    url.toString(),
    { headers: { ...req.headers, host: url.host } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    console.error('Electric proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Electric proxy error' });
    }
  });

  req.on('close', () => proxyReq.destroy());
});

app.listen(3001, '0.0.0.0', () => {
  console.log('API server listening on port 3001');
});
