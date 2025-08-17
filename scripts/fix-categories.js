// Comprehensive script to fix categories
const { fixSymbolsCategory } = require('./fix-symbols-category');
const { addAllFlags } = require('./add-all-flags');
const { fixRedHeart } = require('./fix-red-heart');

async function fixAllCategories() {
  console.log('🔧 Starting comprehensive category fixes...');
  
  try {
    // Set a reasonable timeout for the entire process
    const timeout = setTimeout(() => {
      console.log('⏰ Category fixes taking too long - this is okay, continuing with build...');
    }, 45000); // 45 seconds
    
    // Fix Symbols category (move hearts from Smileys & Emotion to Symbols)
    console.log('📝 Step 1: Fixing Symbols category...');
    await fixSymbolsCategory();
    
    // Add ALL Flags category and flag emojis (195+ country flags)  
    console.log('🏁 Step 2: Adding Flags category...');
    await addAllFlags();
    
    // Fix red heart emoji display issue
    console.log('❤️ Step 3: Fixing red heart emoji...');
    await fixRedHeart();
    
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