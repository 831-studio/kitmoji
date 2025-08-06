const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with debugging - prioritize the full database
let dbPath;
const possiblePaths = [
  path.join(__dirname, '..', 'kitmoji-emojis.db'), // ./kitmoji-emojis.db (full database)
  path.join(process.cwd(), 'kitmoji-emojis.db'),   // process root (full database)
  path.join(__dirname, 'emojis.db'),           // server/emojis.db (fallback)
  path.join(__dirname, '..', 'emojis.db'),     // ./emojis.db (fallback)
  path.join(process.cwd(), 'emojis.db'),       // process root (fallback)
  path.join(process.cwd(), 'server', 'emojis.db'), // process root + server (fallback)
];

for (const testPath of possiblePaths) {
  console.log(`Testing path ${testPath}: exists=${require('fs').existsSync(testPath)}`);
  if (require('fs').existsSync(testPath)) {
    dbPath = testPath;
    break;
  }
}

if (!dbPath) {
  console.error('No database file found at any expected location!');
  dbPath = possiblePaths[0]; // fallback
}
console.log('Database path:', dbPath);
console.log('Database exists:', require('fs').existsSync(dbPath));
if (require('fs').existsSync(dbPath)) {
  const stats = require('fs').statSync(dbPath);
  console.log('Database size:', stats.size, 'bytes');
  console.log('Database modified:', stats.mtime);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes
// Get popular emojis (most commonly used) - MUST be before /api/emojis/:id
app.get('/api/emojis/popular', (req, res) => {
  const popularEmojis = [
    '😀', '😂', '❤️', '😍', '🥰', '😊', '🔥', '💯', '✨', '🎉',
    '👍', '🙏', '💖', '😘', '💕', '😭', '🤣', '🥳', '😎', '🤗',
    '😇', '🙃', '😉', '🤔', '🥺', '😌', '😴', '🤤', '🤪', '🤯',
    '🥶', '🤩', '🤖', '👏', '🤝', '💪', '🧠', '👀', '💋', '🔥'
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

// Get emoji by name (for SEO-friendly URLs)
app.get('/api/emoji/:name', (req, res) => {
  const { name } = req.params;
  // Convert URL slug back to searchable name with flexible matching
  const searchName = name.replace(/-/g, ' ');
  
  db.get(
    `SELECT * FROM emojis 
     WHERE LOWER(REPLACE(REPLACE(name, ':', ''), '-', ' ')) = LOWER(?)
     OR LOWER(REPLACE(name, ':', '')) LIKE LOWER(?)
     OR LOWER(name) LIKE LOWER(?)
     OR LOWER(REPLACE(REPLACE(name, ' ', '-'), ':', '')) LIKE LOWER(?)
     ORDER BY 
       CASE 
         WHEN LOWER(REPLACE(REPLACE(name, ':', ''), '-', ' ')) = LOWER(?) THEN 1 
         WHEN LOWER(REPLACE(name, ':', '')) = LOWER(?) THEN 2 
         WHEN LOWER(name) = LOWER(?) THEN 3 
         ELSE 4 
       END,
       LENGTH(name)
     LIMIT 1`,
    [searchName, `%${searchName}%`, `%${searchName}%`, `%${name}%`, searchName, searchName, searchName],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Emoji not found' });
      }
      res.json(row);
    }
  );
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


// Fix emoji encoding (GET version for easy browser access)
app.get('/api/fix-emojis', (req, res) => {
  console.log('🔧 Starting emoji encoding fix...');
  
  function unicodeToEmoji(unicode) {
    try {
      // Handle both "U+1F600" and "1F600" formats
      const cleanUnicode = unicode.replace(/U\+/g, '').trim();
      const codepoints = cleanUnicode.split(/[\s-]+/).filter(cp => cp.trim());
      let emoji = '';
      for (const codepoint of codepoints) {
        const cleanCodepoint = codepoint.trim().toUpperCase();
        if (cleanCodepoint && cleanCodepoint !== 'FE0F') {
          const code = parseInt(cleanCodepoint, 16);
          if (code && code > 0) {
            emoji += String.fromCodePoint(code);
          }
        }
      }
      return emoji || '❓';
    } catch (error) {
      return '❓';
    }
  }
  
  // Get all emojis
  db.all('SELECT id, unicode, name FROM emojis ORDER BY id', (err, emojis) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    let fixed = 0;
    const updatePromises = emojis.map((emoji) => {
      return new Promise((resolve) => {
        const correctEmoji = unicodeToEmoji(emoji.unicode);
        db.run('UPDATE emojis SET emoji = ? WHERE id = ?', [correctEmoji, emoji.id], (updateErr) => {
          if (!updateErr) {
            fixed++;
          }
          resolve();
        });
      });
    });
    
    Promise.all(updatePromises).then(() => {
      // Test results
      db.all('SELECT emoji, name FROM emojis WHERE name LIKE "%grinning%" OR name LIKE "%heart%" OR name LIKE "%thumbs%" LIMIT 5', (testErr, testResults) => {
        res.json({
          success: true,
          message: `Fixed ${fixed} emojis`,
          total: emojis.length,
          test: testResults ? testResults.map(row => ({ emoji: row.emoji, name: row.name })) : []
        });
      });
    });
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