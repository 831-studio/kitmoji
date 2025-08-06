// Script to generate a comprehensive static sitemap
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection setup
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://user:pass@localhost:5432/kitmoji'
});

// This will be run during build to create a static sitemap.xml
async function generateStaticSitemap() {
  const now = new Date().toISOString();
  
  // Start with static pages
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.kitmoji.net/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.kitmoji.net/unicode</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.kitmoji.net/all-emojis</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.kitmoji.net/popular-emojis</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.kitmoji.net/new-emojis</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;

  try {
    // Query all emojis from database and generate URL slugs
    const client = await pool.connect();
    const result = await client.query('SELECT name FROM emojis ORDER BY name');
    
    console.log(`📊 Found ${result.rows.length} emojis in database`);
    
    // Add all emoji pages
    result.rows.forEach(row => {
      // Generate URL-friendly slug from emoji name
      const slug = row.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Replace multiple hyphens with single
        .trim();
      
      if (slug) { // Only add if slug is valid
        sitemap += `
  <url>
    <loc>https://www.kitmoji.net/emoji/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });
    
    client.release();
    
  } catch (error) {
    console.warn('⚠️ Could not connect to database, using fallback emoji list');
    
    // Fallback to popular emojis if database connection fails
    const popularEmojis = [
      'grinning-face', 'red-heart', 'thumbs-up', 'fire', 'face-with-tears-of-joy',
      'smiling-face-with-heart-eyes', 'ok-hand', 'waving-hand', 'clapping-hands',
      'folded-hands', 'hundred-points', 'sparkles', 'party-popper', 'birthday-cake'
    ];

    popularEmojis.forEach(slug => {
      sitemap += `
  <url>
    <loc>https://www.kitmoji.net/emoji/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
  }

  // Add category pages
  const categories = [
    'smileys-emotion', 'people-body', 'animals-nature', 'food-drink',
    'travel-places', 'activities', 'objects', 'symbols', 'flags'
  ];

  categories.forEach(category => {
    sitemap += `
  <url>
    <loc>https://www.kitmoji.net/category/${category}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;

  // Write to public directory
  const publicDir = path.join(__dirname, '../public');
  const sitemapPath = path.join(publicDir, 'sitemap.xml');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(sitemapPath, sitemap);
  
  // Count URLs in sitemap for reporting
  const urlCount = (sitemap.match(/<url>/g) || []).length;
  console.log(`✅ Generated comprehensive sitemap with ${urlCount} pages`);
  console.log(`📍 Saved to: ${sitemapPath}`);
}

// Run if called directly
if (require.main === module) {
  generateStaticSitemap().catch(console.error);
}

module.exports = { generateStaticSitemap };