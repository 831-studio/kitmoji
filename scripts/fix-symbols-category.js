// Script to update heart emojis to be in Symbols category
const { sql } = require('@vercel/postgres');

const heartEmojis = [
  'red heart',
  'orange heart', 
  'yellow heart',
  'green heart',
  'blue heart',
  'purple heart',
  'black heart',
  'white heart',
  'brown heart',
  'broken heart'
];

async function fixSymbolsCategory() {
  console.log('🔧 Fixing Symbols category for heart emojis...');
  
  try {
    for (const heartName of heartEmojis) {
      const result = await sql`
        UPDATE emojis 
        SET category = 'Symbols'
        WHERE LOWER(name) = LOWER(${heartName})
      `;
      
      console.log(`✅ Updated "${heartName}" to Symbols category (${result.rowCount} rows affected)`);
    }
    
    // Verify the changes
    const symbolsCount = await sql`SELECT COUNT(*) as total FROM emojis WHERE category = 'Symbols'`;
    console.log(`🎯 Total emojis in Symbols category: ${symbolsCount.rows[0].total}`);
    
    console.log('✅ Symbols category fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing Symbols category:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixSymbolsCategory().catch(console.error);
}

module.exports = { fixSymbolsCategory };