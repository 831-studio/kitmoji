// Fix emoji encoding by regenerating emoji characters from Unicode codepoints
const { sql } = require('@vercel/postgres');

function unicodeToEmoji(unicode) {
  try {
    // Handle multiple codepoints separated by spaces
    const codepoints = unicode.split(' ').filter(cp => cp.trim());
    
    let emoji = '';
    for (const codepoint of codepoints) {
      const cleanCodepoint = codepoint.trim().toUpperCase();
      if (cleanCodepoint && cleanCodepoint !== 'FE0F') { // Skip variation selectors for now
        const code = parseInt(cleanCodepoint, 16);
        if (code && code > 0) {
          emoji += String.fromCodePoint(code);
        }
      }
    }
    
    return emoji || '❓'; // Fallback to question mark
  } catch (error) {
    console.warn(`Failed to convert unicode ${unicode}:`, error.message);
    return '❓';
  }
}

async function fixEmojiEncoding() {
  try {
    console.log('🔧 Fixing emoji character encoding...');
    
    // Get all emojis with their Unicode values
    const emojis = await sql`SELECT id, unicode, name FROM emojis ORDER BY id`;
    
    console.log(`Found ${emojis.rows.length} emojis to fix`);
    
    let fixed = 0;
    let failed = 0;
    
    for (const emoji of emojis.rows) {
      try {
        const correctEmoji = unicodeToEmoji(emoji.unicode);
        
        // Update the emoji character
        await sql`UPDATE emojis SET emoji = ${correctEmoji} WHERE id = ${emoji.id}`;
        
        fixed++;
        
        if (fixed % 500 === 0) {
          console.log(`Fixed ${fixed}/${emojis.rows.length} emojis...`);
        }
        
        // Test first few
        if (fixed <= 5) {
          console.log(`Fixed: ${emoji.unicode} -> "${correctEmoji}" (${emoji.name})`);
        }
        
      } catch (error) {
        failed++;
        console.warn(`Failed to fix emoji ${emoji.id}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Encoding fix completed!`);
    console.log(`  Fixed: ${fixed} emojis`);
    console.log(`  Failed: ${failed} emojis`);
    
    // Test some common emojis
    const test = await sql`SELECT emoji, name FROM emojis WHERE name LIKE '%grinning%' OR name LIKE '%heart%' OR name LIKE '%thumbs up%' LIMIT 5`;
    
    console.log('\n🧪 Test results:');
    test.rows.forEach(row => {
      console.log(`  "${row.emoji}" - ${row.name}`);
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  }
}

// Only run if in Vercel environment or if POSTGRES_URL is set
if (process.env.POSTGRES_URL || process.env.VERCEL) {
  fixEmojiEncoding().then(() => {
    console.log('✅ Emoji encoding fix completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
} else {
  console.log('⚠️  No POSTGRES_URL found - run this in Vercel environment');
}

module.exports = { fixEmojiEncoding, unicodeToEmoji };