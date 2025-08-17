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
    // Check if symbols already exist to avoid re-processing
    const existingSymbolsCount = await sql`SELECT COUNT(*) as total FROM emojis WHERE category = 'Symbols'`;
    if (existingSymbolsCount.rows[0].total >= 8) {
      console.log(`✅ Symbols category already has ${existingSymbolsCount.rows[0].total} emojis - skipping fix`);
      return;
    }
    
    let updated = 0;
    for (const heartName of heartEmojis) {
      try {
        const result = await sql`
          UPDATE emojis 
          SET category = 'Symbols'
          WHERE LOWER(name) = LOWER(${heartName}) AND category != 'Symbols'
        `;
        
        if (result.rowCount > 0) {
          console.log(`✅ Updated "${heartName}" to Symbols category`);
          updated++;
        }
      } catch (heartError) {
        console.warn(`⚠️  Error updating ${heartName}:`, heartError.message);
      }
    }
    
    // Verify the changes
    const symbolsCount = await sql`SELECT COUNT(*) as total FROM emojis WHERE category = 'Symbols'`;
    console.log(`🎯 Total emojis in Symbols category: ${symbolsCount.rows[0].total}`);
    console.log(`✅ Updated ${updated} heart emojis to Symbols category!`);
    
  } catch (error) {
    console.error('❌ Error fixing Symbols category:', error);
    // Don't exit with error code - let build continue  
    console.log('⚠️  Continuing build despite symbols fix issues...');
  }
}

// Run if called directly
if (require.main === module) {
  fixSymbolsCategory().catch(console.error);
}

module.exports = { fixSymbolsCategory };