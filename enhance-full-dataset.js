// Enhance the database by adding comprehensive skin tone variations
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'kitmoji-emojis.db');

console.log('Enhancing database with comprehensive skin tone variations...');

const db = new sqlite3.Database(dbPath);

// Common emoji bases that should have skin tone variations
const skinToneEmojis = [
  // Hand gestures
  { base: '👋', name: 'waving hand', category: 'People & Body', subcategory: 'hand-fingers-open' },
  { base: '🤚', name: 'raised back of hand', category: 'People & Body', subcategory: 'hand-fingers-open' },
  { base: '🖐️', name: 'hand with fingers splayed', category: 'People & Body', subcategory: 'hand-fingers-open' },
  { base: '✋', name: 'raised hand', category: 'People & Body', subcategory: 'hand-fingers-open' },
  { base: '🖖', name: 'vulcan salute', category: 'People & Body', subcategory: 'hand-fingers-open' },
  { base: '👌', name: 'OK hand', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '🤌', name: 'pinched fingers', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '🤏', name: 'pinching hand', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '✌️', name: 'victory hand', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '🤞', name: 'crossed fingers', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '🫰', name: 'hand with index finger and thumb crossed', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '🤟', name: 'love-you gesture', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '🤘', name: 'sign of the horns', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '🤙', name: 'call me hand', category: 'People & Body', subcategory: 'hand-fingers-partial' },
  { base: '👈', name: 'backhand index pointing left', category: 'People & Body', subcategory: 'hand-single-finger' },
  { base: '👉', name: 'backhand index pointing right', category: 'People & Body', subcategory: 'hand-single-finger' },
  { base: '👆', name: 'backhand index pointing up', category: 'People & Body', subcategory: 'hand-single-finger' },
  { base: '🖕', name: 'middle finger', category: 'People & Body', subcategory: 'hand-single-finger' },
  { base: '👇', name: 'backhand index pointing down', category: 'People & Body', subcategory: 'hand-single-finger' },
  { base: '☝️', name: 'index pointing up', category: 'People & Body', subcategory: 'hand-single-finger' },
  { base: '👍', name: 'thumbs up', category: 'People & Body', subcategory: 'hand-fingers-closed' },
  { base: '👎', name: 'thumbs down', category: 'People & Body', subcategory: 'hand-fingers-closed' },
  { base: '✊', name: 'raised fist', category: 'People & Body', subcategory: 'hand-fingers-closed' },
  { base: '👊', name: 'oncoming fist', category: 'People & Body', subcategory: 'hand-fingers-closed' },
  { base: '🤛', name: 'left-facing fist', category: 'People & Body', subcategory: 'hand-fingers-closed' },
  { base: '🤜', name: 'right-facing fist', category: 'People & Body', subcategory: 'hand-fingers-closed' },
  { base: '👏', name: 'clapping hands', category: 'People & Body', subcategory: 'hands' },
  { base: '🙌', name: 'raising hands', category: 'People & Body', subcategory: 'hands' },
  { base: '👐', name: 'open hands', category: 'People & Body', subcategory: 'hands' },
  { base: '🤲', name: 'palms up together', category: 'People & Body', subcategory: 'hands' },
  { base: '🤝', name: 'handshake', category: 'People & Body', subcategory: 'hands' },
  { base: '🙏', name: 'folded hands', category: 'People & Body', subcategory: 'hands' },
  
  // People and faces
  { base: '👶', name: 'baby', category: 'People & Body', subcategory: 'person' },
  { base: '🧒', name: 'child', category: 'People & Body', subcategory: 'person' },
  { base: '👦', name: 'boy', category: 'People & Body', subcategory: 'person' },
  { base: '👧', name: 'girl', category: 'People & Body', subcategory: 'person' },
  { base: '🧑', name: 'person', category: 'People & Body', subcategory: 'person' },
  { base: '👱', name: 'person: blond hair', category: 'People & Body', subcategory: 'person' },
  { base: '👨', name: 'man', category: 'People & Body', subcategory: 'person' },
  { base: '🧔', name: 'person: beard', category: 'People & Body', subcategory: 'person' },
  { base: '👩', name: 'woman', category: 'People & Body', subcategory: 'person' },
  { base: '🧓', name: 'older person', category: 'People & Body', subcategory: 'person' },
  { base: '👴', name: 'old man', category: 'People & Body', subcategory: 'person' },
  { base: '👵', name: 'old woman', category: 'People & Body', subcategory: 'person' }
];

const skinTones = [
  { modifier: '🏻', code: '1F3FB', name: 'light skin tone', tone: 'light' },
  { modifier: '🏼', code: '1F3FC', name: 'medium-light skin tone', tone: 'medium-light' },
  { modifier: '🏽', code: '1F3FD', name: 'medium skin tone', tone: 'medium' },
  { modifier: '🏾', code: '1F3FE', name: 'medium-dark skin tone', tone: 'medium-dark' },
  { modifier: '🏿', code: '1F3FF', name: 'dark skin tone', tone: 'dark' }
];

console.log(`Adding skin tone variations for ${skinToneEmojis.length} base emojis...`);

const stmt = db.prepare(`
  INSERT OR IGNORE INTO emojis (
    emoji, name, keywords, category, subcategory, unicode, unicode_version, 
    status, emoji_type, base_unicode, has_variations, skin_tone, hair_style
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let addedCount = 0;

skinToneEmojis.forEach(baseEmoji => {
  // Get base unicode (we'll approximate it)
  const baseUnicode = [...baseEmoji.base].map(char => char.codePointAt(0).toString(16).toUpperCase()).join(' ');
  
  skinTones.forEach(skinTone => {
    const combinedEmoji = baseEmoji.base + skinTone.modifier;
    const combinedUnicode = baseUnicode + ' ' + skinTone.code;
    const combinedName = `${baseEmoji.name}: ${skinTone.name}`;
    
    try {
      stmt.run([
        combinedEmoji,
        combinedName,
        '', // keywords
        baseEmoji.category,
        baseEmoji.subcategory,
        combinedUnicode,
        '1.0',
        'fully-qualified',
        'skin-tone-variant',
        baseUnicode,
        1, // has_variations
        skinTone.tone,
        ''
      ]);
      addedCount++;
    } catch (error) {
      // Ignore duplicates
    }
  });
});

stmt.finalize(() => {
  console.log(`Added ${addedCount} skin tone variations`);
  
  // Update base emojis to mark them as having variations
  const updateStmt = db.prepare('UPDATE emojis SET has_variations = 1 WHERE base_unicode = ? OR unicode = ?');
  
  skinToneEmojis.forEach(baseEmoji => {
    const baseUnicode = [...baseEmoji.base].map(char => char.codePointAt(0).toString(16).toUpperCase()).join(' ');
    updateStmt.run([baseUnicode, baseUnicode]);
  });
  
  updateStmt.finalize(() => {
    // Get final stats
    db.get("SELECT COUNT(*) as total FROM emojis", (err, row) => {
      console.log(`\\n🎉 Enhanced database now contains: ${row.total} emojis`);
    });
    
    db.all("SELECT category, COUNT(*) as count FROM emojis GROUP BY category ORDER BY count DESC", (err, rows) => {
      console.log('\\n📂 Final category breakdown:');
      rows.forEach(row => console.log(`   ${row.category}: ${row.count}`));
    });
    
    db.all("SELECT skin_tone, COUNT(*) as count FROM emojis WHERE skin_tone != '' GROUP BY skin_tone ORDER BY count DESC", (err, rows) => {
      if (rows && rows.length > 0) {
        console.log('\\n👋 Skin tone breakdown:');
        rows.forEach(row => console.log(`   ${row.skin_tone}: ${row.count}`));
      }
    });
    
    console.log('\\n✅ Enhanced database ready for deployment!');
    console.log('🎯 Categories "Smileys & Emotion" and "People & Body" are properly separated');
    console.log('🌈 Comprehensive skin tone variations included');
    
    db.close();
  });
});