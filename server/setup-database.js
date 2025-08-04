const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'emojis.db');

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Create emojis table
  db.run(`
    CREATE TABLE emojis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emoji TEXT NOT NULL,
      name TEXT NOT NULL,
      keywords TEXT,
      category TEXT NOT NULL,
      unicode TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create index for faster searches
  db.run(`CREATE INDEX idx_emoji_name ON emojis(name)`);
  db.run(`CREATE INDEX idx_emoji_category ON emojis(category)`);
  db.run(`CREATE INDEX idx_emoji_keywords ON emojis(keywords)`);

  console.log('Database tables created');

  // Read and import CSV data
  const csvPath = path.join(__dirname, '..', 'emoji_database.csv');
  const emojis = [];

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      emojis.push({
        emoji: row.emoji,
        name: row.name,
        keywords: row.keywords,
        category: row.category,
        unicode: row.unicode
      });
    })
    .on('end', () => {
      console.log(`Read ${emojis.length} emojis from CSV`);
      
      // Insert emojis in batches
      const stmt = db.prepare(`
        INSERT INTO emojis (emoji, name, keywords, category, unicode)
        VALUES (?, ?, ?, ?, ?)
      `);

      emojis.forEach((emoji) => {
        stmt.run([emoji.emoji, emoji.name, emoji.keywords, emoji.category, emoji.unicode]);
      });

      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting data:', err);
        } else {
          console.log(`Successfully imported ${emojis.length} emojis to database`);
        }
        db.close();
      });
    });
});