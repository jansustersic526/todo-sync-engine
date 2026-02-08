import express, { Request, Response } from 'express';
import cors from 'cors';
import pg from 'pg';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(message: string) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on('connection', async (ws) => {
  try {
    const { rows } = await pool.query('SELECT id, title, created_at FROM todos ORDER BY created_at');
    ws.send(JSON.stringify({ type: 'init', todos: rows }));
  } catch (err) {
    console.error('Error sending initial todos:', err);
  }
});

app.post('/todos', async (req: Request, res: Response) => {
  const { id, title } = req.body as { id: string; title: string };
  try {
    const { rows } = await pool.query(
      'INSERT INTO todos (id, title) VALUES ($1, $2) RETURNING id, title, created_at',
      [id, title],
    );
    res.status(201).json(rows[0]);
    broadcast(JSON.stringify({ type: 'added', todo: rows[0] }));
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.delete('/todos/:id', async (req: Request, res: Response) => {
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
    res.status(204).end();
    broadcast(JSON.stringify({ type: 'deleted', id: req.params.id }));
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

server.listen(3001, '0.0.0.0', () => {
  console.log('API-WS server listening on port 3001');
});
