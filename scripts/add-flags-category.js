// Script to add flag emojis to the database
const { sql } = require('@vercel/postgres');

// Common flag emojis that should be in the Flags category
const flagEmojis = [
  { emoji: '🏁', name: 'chequered flag', keywords: 'checkered,racing,finish', unicode: '1F3C1' },
  { emoji: '🏴', name: 'black flag', keywords: 'flag,black', unicode: '1F3F4' },
  { emoji: '🏳️', name: 'white flag', keywords: 'flag,white,surrender', unicode: '1F3F3 FE0F' },
  { emoji: '🏳️‍🌈', name: 'rainbow flag', keywords: 'pride,lgbt,lgbtq,gay,rainbow', unicode: '1F3F3 FE0F 200D 1F308' },
  { emoji: '🏳️‍⚧️', name: 'transgender flag', keywords: 'transgender,trans,pride', unicode: '1F3F3 FE0F 200D 26A7 FE0F' },
  { emoji: '🏴‍☠️', name: 'pirate flag', keywords: 'pirate,skull,crossbones,jolly roger', unicode: '1F3F4 200D 2620 FE0F' },
  { emoji: '🚩', name: 'triangular flag', keywords: 'flag,red,triangular,post', unicode: '1F6A9' },
  { emoji: '🎌', name: 'crossed flags', keywords: 'japan,japanese,flags', unicode: '1F38C' },
  // Country flags - just a few major ones as examples
  { emoji: '🇺🇸', name: 'flag: United States', keywords: 'united states,america,usa,flag', unicode: '1F1FA 1F1F8' },
  { emoji: '🇬🇧', name: 'flag: United Kingdom', keywords: 'united kingdom,britain,uk,flag', unicode: '1F1EC 1F1E7' },
  { emoji: '🇨🇦', name: 'flag: Canada', keywords: 'canada,flag', unicode: '1F1E8 1F1E6' },
  { emoji: '🇦🇺', name: 'flag: Australia', keywords: 'australia,flag', unicode: '1F1E6 1F1FA' },
  { emoji: '🇫🇷', name: 'flag: France', keywords: 'france,french,flag', unicode: '1F1EB 1F1F7' },
  { emoji: '🇩🇪', name: 'flag: Germany', keywords: 'germany,german,flag', unicode: '1F1E9 1F1EA' },
  { emoji: '🇯🇵', name: 'flag: Japan', keywords: 'japan,japanese,flag', unicode: '1F1EF 1F1F5' },
  { emoji: '🇨🇳', name: 'flag: China', keywords: 'china,chinese,flag', unicode: '1F1E8 1F1F3' },
  { emoji: '🇮🇳', name: 'flag: India', keywords: 'india,indian,flag', unicode: '1F1EE 1F1F3' },
  { emoji: '🇧🇷', name: 'flag: Brazil', keywords: 'brazil,brazilian,flag', unicode: '1F1E7 1F1F7' },
  { emoji: '🇷🇺', name: 'flag: Russia', keywords: 'russia,russian,flag', unicode: '1F1F7 1F1FA' },
  { emoji: '🇰🇷', name: 'flag: South Korea', keywords: 'south korea,korean,flag', unicode: '1F1F0 1F1F7' },
  { emoji: '🇮🇹', name: 'flag: Italy', keywords: 'italy,italian,flag', unicode: '1F1EE 1F1F9' },
  { emoji: '🇪🇸', name: 'flag: Spain', keywords: 'spain,spanish,flag', unicode: '1F1EA 1F1F8' },
  { emoji: '🇲🇽', name: 'flag: Mexico', keywords: 'mexico,mexican,flag', unicode: '1F1F2 1F1FD' },
  { emoji: '🇳🇱', name: 'flag: Netherlands', keywords: 'netherlands,dutch,flag', unicode: '1F1F3 1F1F1' },
  { emoji: '🇸🇪', name: 'flag: Sweden', keywords: 'sweden,swedish,flag', unicode: '1F1F8 1F1EA' },
  { emoji: '🇨🇭', name: 'flag: Switzerland', keywords: 'switzerland,swiss,flag', unicode: '1F1E8 1F1ED' },
  { emoji: '🇳🇴', name: 'flag: Norway', keywords: 'norway,norwegian,flag', unicode: '1F1F3 1F1F4' },
  { emoji: '🇩🇰', name: 'flag: Denmark', keywords: 'denmark,danish,flag', unicode: '1F1E9 1F1F0' },
  { emoji: '🇫🇮', name: 'flag: Finland', keywords: 'finland,finnish,flag', unicode: '1F1EB 1F1EE' },
  { emoji: '🇵🇱', name: 'flag: Poland', keywords: 'poland,polish,flag', unicode: '1F1F5 1F1F1' }
];

async function addFlagsCategory() {
  console.log('🏁 Adding Flags category and flag emojis...');
  
  try {
    let added = 0;
    
    for (const flag of flagEmojis) {
      // Check if emoji already exists
      const existing = await sql`
        SELECT id FROM emojis WHERE emoji = ${flag.emoji} OR LOWER(name) = LOWER(${flag.name})
      `;
      
      if (existing.rows.length === 0) {
        // Add new flag emoji
        await sql`
          INSERT INTO emojis (
            emoji, name, keywords, category, subcategory, 
            unicode, unicode_version, status, emoji_type, 
            base_unicode, has_variations, skin_tone, hair_style
          ) VALUES (
            ${flag.emoji}, ${flag.name}, ${flag.keywords}, 'Flags', 'flag',
            ${flag.unicode}, '1.0', 'fully-qualified', 'standard',
            ${flag.unicode}, false, '', ''
          )
        `;
        
        console.log(`✅ Added ${flag.emoji} ${flag.name}`);
        added++;
      } else {
        console.log(`⏭️  ${flag.emoji} ${flag.name} already exists`);
      }
    }
    
    // Verify the changes
    const flagsCount = await sql`SELECT COUNT(*) as total FROM emojis WHERE category = 'Flags'`;
    console.log(`🏁 Total emojis in Flags category: ${flagsCount.rows[0].total}`);
    console.log(`✅ Added ${added} new flag emojis!`);
    
  } catch (error) {
    console.error('❌ Error adding flags:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  addFlagsCategory().catch(console.error);
}

module.exports = { addFlagsCategory };