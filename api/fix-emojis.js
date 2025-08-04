// API endpoint to fix emoji encoding
const { sql } = require('@vercel/postgres');

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

export default async function handler(req, res) {
  try {
    console.log('🔧 Starting emoji encoding fix...');
    
    // Get all emojis
    const emojis = await sql`SELECT id, unicode, name FROM emojis ORDER BY id`;
    
    let fixed = 0;
    let batch = [];
    
    for (const emoji of emojis.rows) {
      const correctEmoji = unicodeToEmoji(emoji.unicode);
      batch.push({ id: emoji.id, emoji: correctEmoji });
      
      // Process in batches of 50
      if (batch.length >= 50) {
        await processBatch(batch);
        fixed += batch.length;
        batch = [];
        
        if (fixed % 500 === 0) {
          console.log(`Fixed ${fixed}/${emojis.rows.length} emojis...`);
        }
      }
    }
    
    // Process remaining batch
    if (batch.length > 0) {
      await processBatch(batch);
      fixed += batch.length;
    }
    
    // Test results
    const test = await sql`SELECT emoji, name FROM emojis WHERE name LIKE '%grinning%' OR name LIKE '%heart%' LIMIT 5`;
    
    res.json({
      success: true,
      message: `Fixed ${fixed} emojis`,
      total: emojis.rows.length,
      test: test.rows
    });
    
  } catch (error) {
    console.error('Fix failed:', error);
    res.status(500).json({ error: error.message });
  }
}

async function processBatch(batch) {
  for (const item of batch) {
    try {
      await sql`UPDATE emojis SET emoji = ${item.emoji} WHERE id = ${item.id}`;
    } catch (error) {
      console.warn(`Failed to update emoji ${item.id}:`, error.message);
    }
  }
}