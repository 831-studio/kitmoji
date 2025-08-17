// Comprehensive script to fix categories
const { fixSymbolsCategory } = require('./fix-symbols-category');
const { addFlagsCategory } = require('./add-flags-category');

async function fixAllCategories() {
  console.log('🔧 Starting comprehensive category fixes...');
  
  try {
    // Fix Symbols category (move hearts from Smileys & Emotion to Symbols)
    await fixSymbolsCategory();
    
    // Add Flags category and flag emojis
    await addFlagsCategory();
    
    console.log('🎉 All category fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fixAllCategories().catch(console.error);
}

module.exports = { fixAllCategories };