const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = path.join(__dirname, 'emojis.db');
const db = new sqlite3.Database(dbPath);

// Routes
// Get popular emojis (most commonly used) - MUST be before /api/emojis/:id
app.get('/api/emojis/popular', (req, res) => {
  const popularEmojis = [
    '😀', '😂', '❤️', '😍', '🥰', '😊', '🔥', '💯', '✨', '🎉',
    '👍', '🙏', '💖', '😘', '💕', '😭'
  ];
  
  const query = `SELECT * FROM emojis WHERE emoji IN (${popularEmojis.map(() => '?').join(', ')}) ORDER BY CASE emoji ${popularEmojis.map((_, i) => `WHEN ? THEN ${i}`).join(' ')} END`;
  const params = [...popularEmojis, ...popularEmojis];
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.get('/api/emojis', (req, res) => {
  const { search, category, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM emojis WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM emojis WHERE 1=1';
  const params = [];
  
  // Add search filter
  if (search) {
    query += ' AND (name LIKE ? OR keywords LIKE ?)';
    countQuery += ' AND (name LIKE ? OR keywords LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  // Add category filter
  if (category && category !== 'all') {
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
  }
  
  query += ' ORDER BY name LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  // Get total count
  db.get(countQuery, params.slice(0, -2), (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Get emojis
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        emojis: rows,
        total: countResult.total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.total / limit)
      });
    });
  });
});

// Get all categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM emojis ORDER BY category', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map(row => row.category));
  });
});

// Get single emoji by ID
app.get('/api/emojis/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM emojis WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    res.json(row);
  });
});

// Add new emoji
app.post('/api/emojis', (req, res) => {
  const { emoji, name, keywords, category, unicode } = req.body;
  
  if (!emoji || !name || !category || !unicode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    'INSERT INTO emojis (emoji, name, keywords, category, unicode) VALUES (?, ?, ?, ?, ?)',
    [emoji, name, keywords || '', category, unicode],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, emoji, name, keywords, category, unicode });
    }
  );
});

// Update emoji
app.put('/api/emojis/:id', (req, res) => {
  const { id } = req.params;
  const { emoji, name, keywords, category, unicode } = req.body;
  
  db.run(
    'UPDATE emojis SET emoji = ?, name = ?, keywords = ?, category = ?, unicode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [emoji, name, keywords, category, unicode, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Emoji not found' });
      }
      res.json({ message: 'Emoji updated successfully' });
    }
  );
});

// Delete emoji
app.delete('/api/emojis/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM emojis WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    res.json({ message: 'Emoji deleted successfully' });
  });
});


// Health check with database info
app.get('/api/health', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM emojis', (err, row) => {
    if (err) {
      res.json({ 
        status: 'ERROR', 
        message: 'Database error',
        error: err.message 
      });
    } else {
      res.json({ 
        status: 'OK', 
        message: 'Kitmoji API is running',
        totalEmojis: row ? row.total : 'unknown',
        databasePath: dbPath
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Kitmoji server running on http://localhost:${PORT}`);
});