// Create the complete 3,794 emoji database that was working locally
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Use the working database name
const dbPath = path.join(__dirname, 'kitmoji-emojis.db');

console.log('Creating complete emoji database at:', dbPath);

// Remove existing database
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Removed existing database');
}

const db = new sqlite3.Database(dbPath);

// Helper functions (same as our working version)
function detectEmojiType(unicode) {
  if (unicode.includes('1F3F')) return 'skin-tone-variant';
  if (unicode.includes('200D')) return 'zwj-sequence';
  if (unicode.match(/^1F1[A-F0-9]{2} 1F1[A-F0-9]{2}$/)) return 'flag';
  if (unicode.split(' ').length > 1) return 'multi-codepoint';
  return 'standard';
}

function getSkinTone(unicode) {
  if (unicode.includes('1F3FB')) return 'light';
  if (unicode.includes('1F3FC')) return 'medium-light';
  if (unicode.includes('1F3FD')) return 'medium';
  if (unicode.includes('1F3FE')) return 'medium-dark';
  if (unicode.includes('1F3FF')) return 'dark';
  return '';
}

// Load keywords if available
let keywords = {};
try {
  if (fs.existsSync('./emoji-keywords-full.json')) {
    keywords = JSON.parse(fs.readFileSync('./emoji-keywords-full.json', 'utf8'));
    console.log(`Loaded ${Object.keys(keywords).length} keyword entries`);
  }
} catch (error) {
  console.warn('Keywords not available, will generate without them');
}

// Create comprehensive emoji dataset (this is the actual Unicode 15.1 data)
const comprehensiveEmojis = [];

// Parse emoji test data if available
if (fs.existsSync('./emoji-test-full.txt')) {
  console.log('Parsing Unicode emoji test data...');
  const testData = fs.readFileSync('./emoji-test-full.txt', 'utf8');
  const lines = testData.split('\\n');
  
  let currentCategory = '';
  let currentSubcategory = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('# group:')) {
      currentCategory = trimmed.replace('# group:', '').trim();
      continue;
    }
    
    if (trimmed.startsWith('# subgroup:')) {
      currentSubcategory = trimmed.replace('# subgroup:', '').trim();
      continue;
    }
    
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes(';') || !trimmed.includes('#')) {
      continue;
    }
    
    try {
      const parts = trimmed.split('#');
      if (parts.length !== 2) continue;
      
      const beforeHash = parts[0].trim();
      const afterHash = parts[1].trim();
      
      const semiIndex = beforeHash.indexOf(';');
      if (semiIndex === -1) continue;
      
      const unicode = beforeHash.substring(0, semiIndex).trim();
      const status = beforeHash.substring(semiIndex + 1).trim();
      
      if (afterHash.length < 3) continue;
      
      const emojiChar = afterHash.charAt(0);
      const versionMatch = afterHash.match(/E([0-9.]+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';
      
      const nameStart = afterHash.indexOf(`E${version} `);
      const name = nameStart !== -1 ? afterHash.substring(nameStart + `E${version} `.length).trim() : 'unknown';
      
      if (status.includes('qualified') || status.includes('component')) {
        const emojiType = detectEmojiType(unicode);
        const skinTone = getSkinTone(unicode);
        const keywordList = keywords[emojiChar] ? keywords[emojiChar].join(', ') : '';
        
        comprehensiveEmojis.push({
          emoji: emojiChar,
          name: name,
          keywords: keywordList,
          category: currentCategory || 'Objects',
          subcategory: currentSubcategory || '',
          unicode: unicode,
          unicode_version: version,
          status: status,
          emoji_type: emojiType,
          base_unicode: unicode.replace(/1F3F[B-F]/g, '').trim(),
          skin_tone: skinTone,
          hair_style: ''
        });
      }
    } catch (error) {
      continue;
    }
  }
  
  console.log(`Parsed ${comprehensiveEmojis.length} emojis from Unicode data`);
} else {
  console.log('Unicode test data not available, using keyword-based generation...');
}

// Add emojis from keywords that weren't in Unicode data
const categoryMapping = {
  'face': 'Smileys & Emotion', 'heart': 'Smileys & Emotion', 'love': 'Smileys & Emotion',
  'smile': 'Smileys & Emotion', 'happy': 'Smileys & Emotion', 'sad': 'Smileys & Emotion',
  'food': 'Food & Drink', 'drink': 'Food & Drink', 'fruit': 'Food & Drink',
  'animal': 'Animals & Nature', 'plant': 'Animals & Nature', 'nature': 'Animals & Nature',
  'car': 'Travel & Places', 'travel': 'Travel & Places', 'building': 'Travel & Places',
  'flag': 'Flags', 'country': 'Flags',
  'sport': 'Activities', 'game': 'Activities', 'music': 'Activities',
  'body': 'People & Body', 'hand': 'People & Body', 'person': 'People & Body',
  'symbol': 'Symbols', 'number': 'Symbols', 'arrow': 'Symbols'
};

for (const [emoji, keywordArray] of Object.entries(keywords)) {
  const exists = comprehensiveEmojis.some(e => e.emoji === emoji);
  if (!exists) {
    const keywordText = keywordArray.join(' ').toLowerCase();
    const name = keywordArray[0] ? keywordArray[0].replace(/_/g, ' ') : 'unknown';
    
    let category = 'Objects';
    for (const [keyword, cat] of Object.entries(categoryMapping)) {
      if (keywordText.includes(keyword)) {
        category = cat;
        break;
      }
    }
    
    const unicode = [...emoji].map(char => char.codePointAt(0).toString(16).toUpperCase()).join(' ');
    
    comprehensiveEmojis.push({
      emoji,
      name,
      keywords: keywordArray.join(', '),
      category,
      subcategory: '',
      unicode: unicode,
      unicode_version: 'unknown',
      status: 'fully-qualified',
      emoji_type: detectEmojiType(unicode),
      base_unicode: unicode.replace(/1F3F[B-F]/g, '').trim(),
      skin_tone: getSkinTone(unicode),
      hair_style: ''
    });
  }
}

console.log(`Total emojis after merging: ${comprehensiveEmojis.length}`);

// Remove duplicates
const uniqueEmojis = [];
const seenUnicode = new Set();

for (const emoji of comprehensiveEmojis) {
  if (!seenUnicode.has(emoji.unicode)) {
    seenUnicode.add(emoji.unicode);
    uniqueEmojis.push(emoji);
  }
}

// Filter to only fully-qualified (like we did locally)
const fullyQualified = uniqueEmojis.filter(emoji => emoji.status === 'fully-qualified');

console.log(`Final fully-qualified emoji count: ${fullyQualified.length}`);

// Create database
db.serialize(() => {
  db.run(`
    CREATE TABLE emojis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emoji TEXT NOT NULL,
      name TEXT NOT NULL,
      keywords TEXT,
      category TEXT NOT NULL,
      subcategory TEXT,
      unicode TEXT NOT NULL,
      unicode_version TEXT,
      status TEXT,
      emoji_type TEXT,
      base_unicode TEXT,
      has_variations BOOLEAN DEFAULT FALSE,
      skin_tone TEXT,
      hair_style TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(unicode)
    )
  `);

  // Create indexes
  const indexes = [
    'CREATE INDEX idx_emoji_name ON emojis(name)',
    'CREATE INDEX idx_emoji_category ON emojis(category)',
    'CREATE INDEX idx_emoji_subcategory ON emojis(subcategory)',
    'CREATE INDEX idx_emoji_keywords ON emojis(keywords)',
    'CREATE INDEX idx_emoji_unicode ON emojis(unicode)',
    'CREATE INDEX idx_emoji_type ON emojis(emoji_type)',
    'CREATE INDEX idx_base_unicode ON emojis(base_unicode)',
    'CREATE INDEX idx_skin_tone ON emojis(skin_tone)'
  ];
  
  indexes.forEach(indexSql => db.run(indexSql));
  console.log('Database schema created');

  console.log(`Inserting ${fullyQualified.length} emojis...`);

  const stmt = db.prepare(`
    INSERT INTO emojis (
      emoji, name, keywords, category, subcategory, unicode, unicode_version, 
      status, emoji_type, base_unicode, has_variations, skin_tone, hair_style
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let inserted = 0;
  fullyQualified.forEach((emoji) => {
    try {
      stmt.run([
        emoji.emoji, emoji.name, emoji.keywords, emoji.category, emoji.subcategory,
        emoji.unicode, emoji.unicode_version, emoji.status, emoji.emoji_type,
        emoji.base_unicode, 0, emoji.skin_tone, emoji.hair_style
      ]);
      inserted++;
    } catch (error) {
      console.warn(`Failed to insert: ${emoji.emoji}`);
    }
  });

  stmt.finalize(() => {
    console.log(`\\n🎉 Successfully created database with ${inserted} emojis!`);
    
    db.get("SELECT COUNT(*) as total FROM emojis", (err, row) => {
      console.log(`\\n📊 Final database count: ${row.total}`);
    });
    
    db.all("SELECT category, COUNT(*) as count FROM emojis GROUP BY category ORDER BY count DESC", (err, rows) => {
      console.log('\\n📂 Categories:');
      rows.forEach(row => console.log(`   ${row.category}: ${row.count}`));
    });
    
    db.all("SELECT emoji_type, COUNT(*) as count FROM emojis GROUP BY emoji_type ORDER BY count DESC", (err, rows) => {
      console.log('\\n🏷️  Types:');
      rows.forEach(row => console.log(`   ${row.emoji_type}: ${row.count}`));
    });
    
    db.all("SELECT skin_tone, COUNT(*) as count FROM emojis WHERE skin_tone != '' GROUP BY skin_tone", (err, rows) => {
      if (rows && rows.length > 0) {
        console.log('\\n👋 Skin tones:');
        rows.forEach(row => console.log(`   ${row.skin_tone}: ${row.count}`));
      }
    });
    
    console.log('\\n✅ Database ready for deployment!');
    db.close();
  });
});