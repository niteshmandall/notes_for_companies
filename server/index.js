import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image handling

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'notes_app'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create tables if they don't exist
  const createTabsTable = `
    CREATE TABLE IF NOT EXISTS tabs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    )`;

  const createNotesTable = `
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tab_id INT,
      title VARCHAR(255),
      content TEXT,
      images JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tab_id) REFERENCES tabs(id) ON DELETE CASCADE
    )`;

  // Execute queries sequentially
  db.query(createTabsTable, (err) => {
    if (err) {
      console.error('Error creating tabs table:', err);
      return;
    }
    console.log('Tabs table created successfully');

    // Create notes table after tabs table is created
    db.query(createNotesTable, (err) => {
      if (err) console.error('Error creating notes table:', err);
      else console.log('Notes table created successfully');
    });
  });
});

// Routes
// Get all tabs
app.get('/api/tabs', (req, res) => {
  db.query('SELECT * FROM tabs', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Create new tab
app.post('/api/tabs', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO tabs (name) VALUES (?)', [name], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: result.insertId, name });
  });
});

// Update tab name
app.put('/api/tabs/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE tabs SET name = ? WHERE id = ?', [name, id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name });
  });
});

// Get notes for a tab
app.get('/api/tabs/:tabId/notes', (req, res) => {
  const { tabId } = req.params;
  db.query('SELECT * FROM notes WHERE tab_id = ?', [tabId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Create new note
app.post('/api/notes', (req, res) => {
  const { tabId, title, content, images } = req.body;
  db.query(
    'INSERT INTO notes (tab_id, title, content, images) VALUES (?, ?, ?, ?)',
    [tabId, title, content, JSON.stringify(images)],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: result.insertId, tabId, title, content, images });
    }
  );
});

// Update note
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, images } = req.body;
  db.query(
    'UPDATE notes SET title = ?, content = ?, images = ? WHERE id = ?',
    [title, content, JSON.stringify(images), id],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, title, content, images });
    }
  );
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM notes WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id });
  });
});

// Delete tab
app.delete('/api/tabs/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tabs WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 