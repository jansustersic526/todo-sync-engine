const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
});

app.post('/todos', async (req, res) => {
  const { id, title } = req.body;
  try {
    await pool.query('INSERT INTO todos (id, title) VALUES ($1, $2)', [id, title]);
    res.status(201).json({ id, title });
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting todo:', err);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('API server listening on port 3001');
});
