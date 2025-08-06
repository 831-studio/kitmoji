// Generate dynamic sitemap for all emoji pages and static pages
const { sql } = require('@vercel/postgres');

// Helper function to generate emoji slug consistently
const generateEmojiSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[:\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Generate sitemap XML
async function generateSitemap(req, res) {
  try {
    // Get current date for lastmod
    const now = new Date().toISOString();
    
    // Static pages with high priority
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/unicode', changefreq: 'weekly', priority: '0.9' },
      { url: '/all-emojis', changefreq: 'weekly', priority: '0.9' },
      { url: '/popular-emojis', changefreq: 'weekly', priority: '0.9' },
      { url: '/new-emojis', changefreq: 'monthly', priority: '0.8' },
    ];
    
    // Get all emojis for individual pages
    const emojis = await sql`SELECT name FROM emojis ORDER BY id`;
    
    // Get all categories
    const categories = await sql`SELECT DISTINCT category FROM emojis WHERE category IS NOT NULL ORDER BY category`;
    
    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>https://www.kitmoji.net${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add category pages
    categories.rows.forEach(row => {
      const categorySlug = row.category.toLowerCase().replace(/\s+/g, '-');
      sitemap += `
  <url>
    <loc>https://www.kitmoji.net/category/${categorySlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add individual emoji pages
    emojis.rows.forEach(row => {
      const emojiSlug = generateEmojiSlug(row.name);
      sitemap += `
  <url>
    <loc>https://www.kitmoji.net/emoji/${emojiSlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    res.send(sitemap);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

module.exports = { generateSitemap };