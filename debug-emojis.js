// Debug script to check emoji data quality
const { sql } = require('@vercel/postgres');

async function debugEmojis() {
  try {
    console.log('🔍 Debugging emoji data...');
    
    // Check first 10 emojis
    const sample = await sql`SELECT emoji, name, unicode, category FROM emojis LIMIT 10`;
    
    console.log('\n📊 Sample emoji data:');
    sample.rows.forEach(row => {
      console.log(`Emoji: "${row.emoji}" | Name: ${row.name} | Unicode: ${row.unicode} | Category: ${row.category}`);
      console.log(`  Character codes: ${[...row.emoji].map(c => c.codePointAt(0).toString(16)).join(' ')}`);
      console.log('---');
    });
    
    // Check categories
    const categories = await sql`SELECT category, COUNT(*) as count FROM emojis GROUP BY category ORDER BY count DESC`;
    console.log('\n📂 Categories:');
    categories.rows.forEach(cat => {
      console.log(`  ${cat.category}: ${cat.count}`);
    });
    
    // Check for common emojis that should work
    const common = await sql`SELECT emoji, name FROM emojis WHERE name LIKE '%face%' OR name LIKE '%smile%' LIMIT 5`;
    console.log('\n😀 Common face emojis:');
    common.rows.forEach(row => {
      console.log(`  "${row.emoji}" - ${row.name}`);
    });
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugEmojis();