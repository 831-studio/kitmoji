const express = require('express');
const { sql } = require('@vercel/postgres');
const cors = require('cors');

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
    res.json(result.rows);
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
      
      // Handle skin tone patterns: "artist-dark-skin-tone" -> "artist: dark skin tone"
      const skinTonePattern = /^(.+)-(light|medium-light|medium|medium-dark|dark)-skin-tone$/;
      const skinToneMatch = slug.match(skinTonePattern);
      if (skinToneMatch) {
        const baseName = skinToneMatch[1].replace(/-/g, ' ');
        const skinTone = skinToneMatch[2];
        variants.push(`${baseName}: ${skinTone} skin tone`);
      }
      
      // Handle other colon patterns
      const colonPattern = /^(.+)-(light|medium-light|medium|medium-dark|dark)$/;
      const colonMatch = slug.match(colonPattern);
      if (colonMatch) {
        const baseName = colonMatch[1].replace(/-/g, ' ');
        const modifier = colonMatch[2];
        variants.push(`${baseName}: ${modifier}`);
      }
      
      return variants;
    }
    
    const searchVariants = generateSearchVariants(name);
    let result;
    
    // Try exact matches for each variant
    for (const variant of searchVariants) {
      result = await sql`SELECT * FROM emojis WHERE LOWER(name) = LOWER(${variant}) LIMIT 1`;
      if (result.rows.length > 0) {
        break;
      }
    }
    
    // If no exact match, try partial matches
    if (result.rows.length === 0) {
      const searchName = name.replace(/-/g, ' ');
      result = await sql`
        SELECT * FROM emojis 
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

app.listen(PORT, () => {
  console.log(`Kitmoji server with Postgres running on http://localhost:${PORT}`);
});

module.exports = app;