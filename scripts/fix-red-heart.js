// Script to fix the red heart emoji display issue
const { sql } = require('@vercel/postgres');

async function fixRedHeart() {
  console.log('❤️ Fixing red heart emoji display...');
  
  try {
    // The correct red heart with variation selector
    const correctRedHeart = '❤️'; // U+2764 U+FE0F
    
    // Update the red heart emoji to use the correct Unicode rendering
    const result = await sql`
      UPDATE emojis 
      SET emoji = ${correctRedHeart}
      WHERE LOWER(name) = 'red heart'
    `;
    
    if (result.rowCount > 0) {
      console.log(`✅ Updated red heart emoji (${result.rowCount} rows affected)`);
      
      // Verify the fix
      const verifyResult = await sql`
        SELECT emoji, name, unicode FROM emojis WHERE LOWER(name) = 'red heart'
      `;
      
      if (verifyResult.rows.length > 0) {
        const redHeart = verifyResult.rows[0];
        console.log(`🔍 Verification: ${redHeart.emoji} "${redHeart.name}" (${redHeart.unicode})`);
      }
    } else {
      console.log('⚠️  No red heart found to update');
    }
    
  } catch (error) {
    console.error('❌ Error fixing red heart:', error);
    // Don't exit with error - let build continue
    console.log('⚠️  Continuing despite red heart fix issues...');
  }
}

// Run if called directly
if (require.main === module) {
  fixRedHeart().catch(console.error);
}

module.exports = { fixRedHeart };