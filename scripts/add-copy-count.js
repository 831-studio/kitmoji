const { sql } = require('@vercel/postgres');

async function addCopyCountColumn() {
  try {
    console.log('Adding copy_count column to emojis table...');
    
    // Add copy_count column if it doesn't exist
    await sql`
      ALTER TABLE emojis 
      ADD COLUMN IF NOT EXISTS copy_count INTEGER DEFAULT 0
    `;
    
    console.log('✅ Successfully added copy_count column');
    
    // Verify the column was added
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'emojis' 
      AND column_name = 'copy_count'
    `;
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: copy_count column exists');
    } else {
      console.log('⚠️ Warning: copy_count column may not have been added');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding copy_count column:', error);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  addCopyCountColumn();
}

module.exports = { addCopyCountColumn };