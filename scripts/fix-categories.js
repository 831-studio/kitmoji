// Comprehensive script to fix categories
const { fixSymbolsCategory } = require('./fix-symbols-category');
const { addAllFlags } = require('./add-all-flags');

async function fixAllCategories() {
  console.log('🔧 Starting comprehensive category fixes...');
  
  try {
    // Set a reasonable timeout for the entire process
    const timeout = setTimeout(() => {
      console.log('⏰ Category fixes taking too long - this is okay, continuing with build...');
    }, 30000); // 30 seconds
    
    // Fix Symbols category (move hearts from Smileys & Emotion to Symbols)
    console.log('📝 Step 1: Fixing Symbols category...');
    await fixSymbolsCategory();
    
    // Add ALL Flags category and flag emojis (195+ country flags)  
    console.log('🏁 Step 2: Adding Flags category...');
    await addAllFlags();
    
    clearTimeout(timeout);
    console.log('🎉 All category fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing categories:', error);
    console.log('⚠️  Build will continue despite category fix issues...');
    // Don't exit with error - let build continue
  }
}

// Run if called directly
if (require.main === module) {
  fixAllCategories().catch(console.error);
}

module.exports = { fixAllCategories };