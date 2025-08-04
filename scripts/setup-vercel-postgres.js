// Vercel Postgres setup script - runs during build
const { sql } = require('@vercel/postgres');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

function unicodeToEmoji(unicode) {
  try {
    const codepoints = unicode.split(' ').filter(cp => cp.trim());
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

async function setupVercelPostgres() {
  console.log('🚀 Setting up Vercel Postgres for Kitmoji...');
  
  try {
    // Check if table already exists
    try {
      const existingCount = await sql`SELECT COUNT(*) as total FROM emojis`;
      if (existingCount.rows[0].total > 0) {
        console.log(`✅ Database already setup with ${existingCount.rows[0].total} emojis`);
        return;
      }
    } catch (error) {
      console.log('📋 Creating database schema...');
    }
    
    // Create the emojis table
    await sql`
      CREATE TABLE IF NOT EXISTS emojis (
        id SERIAL PRIMARY KEY,
        emoji TEXT NOT NULL,
        name TEXT NOT NULL,
        keywords TEXT DEFAULT '',
        category TEXT NOT NULL,
        subcategory TEXT DEFAULT '',
        unicode TEXT NOT NULL UNIQUE,
        unicode_version TEXT DEFAULT 'unknown',
        status TEXT DEFAULT 'fully-qualified',
        emoji_type TEXT DEFAULT 'standard',
        base_unicode TEXT DEFAULT '',
        has_variations BOOLEAN DEFAULT FALSE,
        skin_tone TEXT DEFAULT '',
        hair_style TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_emojis_category ON emojis(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_emojis_name ON emojis(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_emojis_unicode ON emojis(unicode)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_emojis_status ON emojis(status)`;
    
    console.log('✅ Database schema created');
    
    // Check if we have local SQLite data to migrate
    const sqlitePath = path.join(process.cwd(), 'kitmoji-emojis.db');
    if (!fs.existsSync(sqlitePath)) {
      console.log('⚠️  No SQLite database found - creating minimal dataset');
      await createMinimalDataset();
      return;
    }
    
    // Migrate from SQLite
    console.log('📦 Migrating emojis from SQLite...');
    const db = new sqlite3.Database(sqlitePath);
    
    const emojis = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM emojis ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`Found ${emojis.length} emojis to migrate`);
    
    if (emojis.length === 0) {
      await createMinimalDataset();
      db.close();
      return;
    }
    
    // Insert emojis in batches with proper Unicode conversion
    let migrated = 0;
    for (const emoji of emojis) {
      try {
        // Generate correct emoji character from unicode
        const correctEmoji = unicodeToEmoji(emoji.unicode);
        
        await sql`
          INSERT INTO emojis (
            emoji, name, keywords, category, subcategory, 
            unicode, unicode_version, status, emoji_type, 
            base_unicode, has_variations, skin_tone, hair_style
          ) VALUES (
            ${correctEmoji}, ${emoji.name}, ${emoji.keywords || ''}, 
            ${emoji.category}, ${emoji.subcategory || ''}, 
            ${emoji.unicode}, ${emoji.unicode_version || 'unknown'}, 
            ${emoji.status || 'fully-qualified'}, ${emoji.emoji_type || 'standard'}, 
            ${emoji.base_unicode || emoji.unicode}, ${emoji.has_variations || false}, 
            ${emoji.skin_tone || ''}, ${emoji.hair_style || ''}
          )
        `;
        migrated++;
        
        if (migrated % 500 === 0) {
          console.log(`Migrated ${migrated}/${emojis.length} emojis...`);
        }
      } catch (error) {
        if (!error.message.includes('duplicate key')) {
          console.warn(`Failed to migrate emoji ${emoji.emoji}: ${error.message}`);
        }
      }
    }
    
    db.close();
    
    // Verify final count
    const result = await sql`SELECT COUNT(*) as total FROM emojis`;
    const total = result.rows[0].total;
    
    console.log(`🎉 Migration completed! Database contains ${total} emojis`);
    
    // Show category breakdown
    const categories = await sql`
      SELECT category, COUNT(*) as count 
      FROM emojis 
      GROUP BY category 
      ORDER BY count DESC
    `;
    
    console.log('\n📂 Category breakdown:');
    categories.rows.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count} emojis`);
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

async function createMinimalDataset() {
  console.log('Creating minimal emoji dataset...');
  
  const basicEmojis = [
    { emoji: '😀', name: 'grinning face', category: 'Smileys & Emotion', unicode: '1F600' },
    { emoji: '😂', name: 'face with tears of joy', category: 'Smileys & Emotion', unicode: '1F602' },
    { emoji: '❤️', name: 'red heart', category: 'Smileys & Emotion', unicode: '2764 FE0F' },
    { emoji: '👍', name: 'thumbs up', category: 'People & Body', unicode: '1F44D' },
    { emoji: '🔥', name: 'fire', category: 'Travel & Places', unicode: '1F525' },
    { emoji: '💯', name: 'hundred points', category: 'Smileys & Emotion', unicode: '1F4AF' }
  ];
  
  for (const emoji of basicEmojis) {
    await sql`
      INSERT INTO emojis (emoji, name, category, unicode, keywords)
      VALUES (${emoji.emoji}, ${emoji.name}, ${emoji.category}, ${emoji.unicode}, ${emoji.name})
    `;
  }
  
  console.log('✅ Created basic emoji dataset');
}

if (require.main === module) {
  setupVercelPostgres().then(() => {
    console.log('✅ Vercel Postgres setup completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupVercelPostgres };