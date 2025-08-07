const express = require('express');
const { sql } = require('@vercel/postgres');
const cors = require('cors');

const app = express();

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
    
    const params = [...popularEmojis, ...popularEmojis];
    
    const result = await sql.query(query, params);
    
    res.json({ 
      emojis: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get new emojis (latest Unicode version)
app.get('/api/emojis/new', async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM emojis 
      WHERE unicode_version IN ('15.0', '15.1', '14.0', '13.1', '13.0')
      ORDER BY unicode_version DESC, name ASC
      LIMIT 50
    `;
    
    res.json({ 
      emojis: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all emojis with pagination, search, and filtering
app.get('/api/emojis', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      search = '', 
      category = '', 
      status = 'fully-qualified' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Add search condition
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR keywords ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add category condition
    if (category) {
      whereConditions.push(`category ILIKE $${paramIndex}`);
      params.push(`%${category}%`);
      paramIndex++;
    }

    // Add status condition
    if (status && status !== 'all') {
      whereConditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM emojis ${whereClause}`;
    const countResult = await sql.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Get paginated results
    const dataQuery = `
      SELECT *, COALESCE(copy_count, 0) as copy_count FROM emojis 
      ${whereClause} 
      ORDER BY name ASC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), offset);
    
    const result = await sql.query(dataQuery, params);
    
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      emojis: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get emoji by ID
app.get('/api/emojis/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await sql`SELECT *, COALESCE(copy_count, 0) as copy_count FROM emojis WHERE id = ${id}`;
    
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

module.exports = app;