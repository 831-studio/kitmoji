const { sql } = require('@vercel/postgres');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

async function migrateToPostgres() {
  console.log('Starting migration from SQLite to PostgreSQL...');
  
  try {
    // First, create the schema
    console.log('Creating PostgreSQL schema...');
    const schemaSQL = fs.readFileSync('./server/postgres-schema.sql', 'utf8');
    
    // Split schema into individual statements and execute them
    const statements = schemaSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sql.query(statement + ';');
        } catch (error) {
          // Ignore errors for CREATE IF NOT EXISTS statements that already exist
          if (!error.message.includes('already exists')) {
            console.warn(`Warning executing schema statement: ${error.message}`);
          }
        }
      }
    }
    
    console.log('Schema created successfully!');
    
    // Check if we have data to migrate
    if (!fs.existsSync('./kitmoji-emojis.db')) {
      console.log('No SQLite database found to migrate from');
      return;
    }
    
    // Connect to SQLite database
    const db = new sqlite3.Database('./kitmoji-emojis.db');
    
    // Get all emojis from SQLite
    const emojis = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM emojis ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`Found ${emojis.length} emojis to migrate`);
    
    if (emojis.length === 0) {
      console.log('No emojis to migrate');
      db.close();
      return;
    }
    
    // Clear existing data in PostgreSQL (for clean migration)
    await sql`DELETE FROM emojis`;
    console.log('Cleared existing PostgreSQL data');
    
    // Migrate emojis in batches
    const batchSize = 100;
    let migrated = 0;
    
    for (let i = 0; i < emojis.length; i += batchSize) {
      const batch = emojis.slice(i, i + batchSize);
      
      try {
        for (const emoji of batch) {
          await sql`
            INSERT INTO emojis (
              emoji, name, keywords, category, subcategory, 
              unicode, unicode_version, status, emoji_type, 
              base_unicode, has_variations, skin_tone, hair_style
            ) VALUES (
              ${emoji.emoji}, ${emoji.name}, ${emoji.keywords || ''}, 
              ${emoji.category}, ${emoji.subcategory || ''}, 
              ${emoji.unicode}, ${emoji.unicode_version || 'unknown'}, 
              ${emoji.status || 'fully-qualified'}, ${emoji.emoji_type || 'standard'}, 
              ${emoji.base_unicode || emoji.unicode}, ${emoji.has_variations || false}, 
              ${emoji.skin_tone || ''}, ${emoji.hair_style || ''}
            )
          `;
          migrated++;
        }
        
        console.log(`Migrated ${migrated}/${emojis.length} emojis...`);
      } catch (error) {
        console.error(`Error migrating batch starting at ${i}:`, error.message);
        // Continue with next batch
      }
    }
    
    // Verify migration
    const result = await sql`SELECT COUNT(*) as total FROM emojis`;
    const total = result.rows[0].total;
    
    console.log(`Migration completed! Migrated ${migrated} emojis.`);
    console.log(`PostgreSQL now contains ${total} emojis.`);
    
    // Get category breakdown
    const categories = await sql`
      SELECT category, COUNT(*) as count 
      FROM emojis 
      GROUP BY category 
      ORDER BY count DESC
    `;
    
    console.log('\nCategory breakdown:');
    categories.rows.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count} emojis`);
    });
    
    db.close();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToPostgres().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = { migrateToPostgres };