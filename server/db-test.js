// Simple database test to verify emoji count
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'emojis.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    return;
  }
  console.log('Connected to database successfully');
  
  db.get('SELECT COUNT(*) as total FROM emojis', (err, row) => {
    if (err) {
      console.error('Query error:', err.message);
    } else {
      console.log('Total emojis in database:', row.total);
    }
    
    db.all('SELECT DISTINCT category FROM emojis ORDER BY category', (err, rows) => {
      if (err) {
        console.error('Categories query error:', err.message);
      } else {
        console.log('Categories:');
        rows.forEach(row => console.log('  -', row.category));
      }
      db.close();
    });
  });
});