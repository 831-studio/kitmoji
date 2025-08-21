const express = require('express');
const { sql } = require('@vercel/postgres');
const cors = require('cors');
const { generateSitemap } = require('./sitemap');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());


// Health check with database info
app.get('/api/health', async (req, res) => {
  try {
    const result = await sql`SELECT COUNT(*) as total FROM emojis`;
    const totalEmojis = result.rows[0].total;
    
    res.json({ 
      status: 'OK', 
      message: 'Kitmoji API running with Postgres - Ready!',
      totalEmojis: parseInt(totalEmojis),
      database: 'Vercel Postgres'
    });
  } catch (error) {
    res.json({ 
      status: 'ERROR', 
      message: 'Database connection error',
      error: error.message 
    });
  }
});

// Get popular emojis (most commonly used)
app.get('/api/emojis/popular', async (req, res) => {
  try {
    const popularEmojis = [
      '😀', '😂', '❤️', '😍', '🥰', '😊', '🔥', '💯', '✨', '🎉',
      '👍', '🙏', '💖', '😘', '💕', '😭'
    ];
    
    const placeholders = popularEmojis.map((_, i) => `$${i + 1}`).join(', ');
    const orderCase = popularEmojis.map((_, i) => `WHEN $${i + 1 + popularEmojis.length} THEN ${i}`).join(' ');
    
    const query = `
      SELECT * FROM emojis 
      WHERE emoji IN (${placeholders}) 
      ORDER BY CASE emoji ${orderCase} END
    `;
    
    const result = await sql.query(query, [...popularEmojis, ...popularEmojis]);
    res.json({ 
      emojis: result.rows,
      total: result.rows.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all emojis with pagination and filtering
app.get('/api/emojis', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    // Add search filter
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR keywords ILIKE $${paramIndex + 1})`);
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
      paramIndex += 2;
    }
    
    // Add category filter
    if (category && category !== 'all') {
      whereConditions.push(`category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM emojis ${whereClause}`;
    const countResult = await sql.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get emojis with pagination
    const dataQuery = `
      SELECT * FROM emojis 
      ${whereClause}
      ORDER BY name 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    queryParams.push(parseInt(limit), offset);
    
    const dataResult = await sql.query(dataQuery, queryParams);
    
    res.json({
      emojis: dataResult.rows,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await sql`SELECT DISTINCT category FROM emojis ORDER BY category`;
    const categories = result.rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single emoji by ID
app.get('/api/emojis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`SELECT * FROM emojis WHERE id = ${id}`;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emoji by name (for SEO-friendly URLs)
app.get('/api/emoji/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    // Function to convert slug back to potential emoji names
    function generateSearchVariants(slug) {
      const variants = [];
      
      // Basic: replace hyphens with spaces
      const basic = slug.replace(/-/g, ' ');
      variants.push(basic);
      
      // Keep original with hyphens (for names like "T-Rex", "X-ray", etc.)
      variants.push(slug);
      
      // Title case version with hyphens (t-rex -> T-Rex)
      const titleCaseHyphen = slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join('-');
      variants.push(titleCaseHyphen);
      
      // Handle compound phrases with partial hyphens: "hear-no-evil-monkey" -> "hear-no-evil monkey"
      // This is for emojis where some parts stay hyphenated in the database
      if (slug.includes('-') && slug.split('-').length > 2) {
        const words = slug.split('-');
        // Try combinations where the last word is separated by space
        if (words.length >= 3) {
          const lastWord = words.pop();
          const restWithHyphens = words.join('-');
          variants.push(`${restWithHyphens} ${lastWord}`);
        }
      }
      
      // Handle compound words that might have internal hyphens
      // "smiling-face-with-heart-eyes" could be "smiling face with heart-eyes"
      const words = slug.split('-');
      if (words.length > 2) {
        // Try variations where compound words keep their hyphens
        // Look for common compound patterns
        const compoundPatterns = ['heart-eyes', 'one-piece', 'up-down', 'left-right', 'e-mail', 't-shirt', 'p-button'];
        
        for (const pattern of compoundPatterns) {
          const patternWords = pattern.split('-');
          const patternIndex = words.findIndex((w, i) => 
            i < words.length - 1 && 
            w === patternWords[0] && 
            words[i + 1] === patternWords[1]
          );
          
          if (patternIndex !== -1) {
            const modifiedWords = [...words];
            modifiedWords[patternIndex] = pattern;
            modifiedWords.splice(patternIndex + 1, patternWords.length - 1);
            const variant = modifiedWords.join(' ').replace(/-/g, (match, offset, string) => {
              // Keep hyphens that are part of compound words
              const beforeChar = string[offset - 1];
              const afterChar = string[offset + 1];
              if (beforeChar && afterChar && beforeChar !== ' ' && afterChar !== ' ') {
                return '-';
              }
              return ' ';
            });
            variants.push(variant);
          }
        }
      }
      
      // Handle skin tone patterns: "artist-dark-skin-tone" -> "artist: dark skin tone"
      // Handle compound skin tones first, then single ones
      const compoundSkinTonePattern = /^(.+)-(medium-light|medium-dark)-skin-tone$/;
      const compoundSkinToneMatch = slug.match(compoundSkinTonePattern);
      if (compoundSkinToneMatch) {
        const baseName = compoundSkinToneMatch[1].replace(/-/g, ' ');
        const skinTone = compoundSkinToneMatch[2];
        variants.push(`${baseName}: ${skinTone} skin tone`);
      } else {
        // Handle single skin tones
        const skinTonePattern = /^(.+)-(light|medium|dark)-skin-tone$/;
        const skinToneMatch = slug.match(skinTonePattern);
        if (skinToneMatch) {
          const baseName = skinToneMatch[1].replace(/-/g, ' ');
          const skinTone = skinToneMatch[2];
          variants.push(`${baseName}: ${skinTone} skin tone`);
        }
      }
      
      // Handle other colon patterns (without skin-tone suffix)
      const compoundColonPattern = /^(.+)-(medium-light|medium-dark)$/;
      const compoundColonMatch = slug.match(compoundColonPattern);
      if (compoundColonMatch) {
        const baseName = compoundColonMatch[1].replace(/-/g, ' ');
        const modifier = compoundColonMatch[2];
        variants.push(`${baseName}: ${modifier}`);
      } else {
        const colonPattern = /^(.+)-(light|medium|dark)$/;
        const colonMatch = slug.match(colonPattern);
        if (colonMatch) {
          const baseName = colonMatch[1].replace(/-/g, ' ');
          const modifier = colonMatch[2];
          variants.push(`${baseName}: ${modifier}`);
        }
      }
      
      // Handle flag patterns: "flag-australia" -> "flag: Australia"
      const flagPattern = /^flag-(.+)$/;
      const flagMatch = slug.match(flagPattern);
      if (flagMatch) {
        const countryName = flagMatch[1].replace(/-/g, ' ');
        // Title case the country name
        const titleCaseCountry = countryName.replace(/\b\w/g, l => l.toUpperCase());
        variants.push(`flag: ${titleCaseCountry}`);
      }
      
      return variants;
    }
    
    const searchVariants = generateSearchVariants(name);
    let result;
    
    // Try exact matches for each variant
    for (const variant of searchVariants) {
      result = await sql`SELECT *, COALESCE(copy_count, 0) as copy_count FROM emojis WHERE LOWER(name) = LOWER(${variant}) LIMIT 1`;
      if (result.rows.length > 0) {
        break;
      }
    }
    
    // If no exact match, try partial matches
    if (result.rows.length === 0) {
      const searchName = name.replace(/-/g, ' ');
      result = await sql`
        SELECT *, COALESCE(copy_count, 0) as copy_count FROM emojis 
        WHERE name ILIKE ${`%${searchName}%`}
        ORDER BY 
          CASE WHEN LOWER(name) = LOWER(${searchName}) THEN 1 ELSE 2 END,
          LENGTH(name)
        LIMIT 1
      `;
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new emoji
app.post('/api/emojis', async (req, res) => {
  try {
    const { emoji, name, keywords, category, subcategory, unicode, unicode_version, status, emoji_type, base_unicode, skin_tone, hair_style } = req.body;
    
    if (!emoji || !name || !category || !unicode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await sql`
      INSERT INTO emojis (emoji, name, keywords, category, subcategory, unicode, unicode_version, status, emoji_type, base_unicode, has_variations, skin_tone, hair_style)
      VALUES (${emoji}, ${name}, ${keywords || ''}, ${category}, ${subcategory || ''}, ${unicode}, ${unicode_version || 'unknown'}, ${status || 'fully-qualified'}, ${emoji_type || 'standard'}, ${base_unicode || unicode}, ${false}, ${skin_tone || ''}, ${hair_style || ''})
      RETURNING *
    `;
    
    res.json(result.rows[0]);
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      res.status(409).json({ error: 'Emoji with this Unicode already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update emoji
app.put('/api/emojis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji, name, keywords, category, subcategory, unicode, unicode_version, status, emoji_type, base_unicode, skin_tone, hair_style } = req.body;
    
    const result = await sql`
      UPDATE emojis 
      SET emoji = ${emoji}, name = ${name}, keywords = ${keywords}, category = ${category}, 
          subcategory = ${subcategory}, unicode = ${unicode}, unicode_version = ${unicode_version},
          status = ${status}, emoji_type = ${emoji_type}, base_unicode = ${base_unicode},
          skin_tone = ${skin_tone}, hair_style = ${hair_style}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    
    res.json({ message: 'Emoji updated successfully', emoji: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete emoji
app.delete('/api/emojis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`DELETE FROM emojis WHERE id = ${id} RETURNING id`;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    
    res.json({ message: 'Emoji deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track emoji copy
app.post('/api/emoji/:id/copy', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Increment copy count
    const result = await sql`
      UPDATE emojis 
      SET copy_count = COALESCE(copy_count, 0) + 1
      WHERE id = ${id}
      RETURNING copy_count
    `;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    
    res.json({ copy_count: result.rows[0].copy_count });
  } catch (error) {
    // If copy_count column doesn't exist, return a default value
    if (error.message.includes('column "copy_count" of relation "emojis" does not exist')) {
      res.json({ copy_count: 0 });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get emoji copy count
app.get('/api/emoji/:id/copy-count', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await sql`
      SELECT COALESCE(copy_count, 0) as copy_count 
      FROM emojis 
      WHERE id = ${id}
    `;
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Emoji not found' });
    }
    
    res.json({ copy_count: result.rows[0].copy_count });
  } catch (error) {
    // If copy_count column doesn't exist, return a default value
    if (error.message.includes('column "copy_count"')) {
      res.json({ copy_count: 0 });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Fix emoji encoding (GET version for easy browser access)
app.get('/api/fix-emojis', async (req, res) => {
  try {
    console.log('🔧 Starting emoji encoding fix...');
    
    function unicodeToEmoji(unicode) {
      try {
        const codepoints = unicode.split(' ').filter(cp => cp.trim());
        let emoji = '';
        for (const codepoint of codepoints) {
          const cleanCodepoint = codepoint.trim().toUpperCase();
          if (cleanCodepoint && cleanCodepoint !== 'FE0F') {
            const code = parseInt(cleanCodepoint, 16);
            if (code && code > 0) {
              emoji += String.fromCodePoint(code);
            }
          }
        }
        return emoji || '❓';
      } catch (error) {
        return '❓';
      }
    }
    
    // Get all emojis
    const emojis = await sql`SELECT id, unicode, name FROM emojis ORDER BY id`;
    
    let fixed = 0;
    
    for (const emoji of emojis.rows) {
      try {
        const correctEmoji = unicodeToEmoji(emoji.unicode);
        await sql`UPDATE emojis SET emoji = ${correctEmoji} WHERE id = ${emoji.id}`;
        fixed++;
        
        if (fixed % 500 === 0) {
          console.log(`Fixed ${fixed}/${emojis.rows.length} emojis...`);
        }
      } catch (error) {
        console.warn(`Failed to update emoji ${emoji.id}:`, error.message);
      }
    }
    
    // Test results
    const test = await sql`SELECT emoji, name FROM emojis WHERE name LIKE '%grinning%' OR name LIKE '%heart%' OR name LIKE '%thumbs%' LIMIT 5`;
    
    res.json({
      success: true,
      message: `Fixed ${fixed} emojis`,
      total: emojis.rows.length,
      test: test.rows.map(row => ({ emoji: row.emoji, name: row.name }))
    });
    
  } catch (error) {
    console.error('Fix failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Static files (sitemap.xml and robots.txt) are now served from /public directory

app.listen(PORT, () => {
  console.log(`Kitmoji server with Postgres running on http://localhost:${PORT}`);
});

module.exports = app;