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

// Helper function to escape XML entities
const escapeXml = (unsafe) => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
    const emojis = await sql`SELECT name FROM emojis ORDER BY id LIMIT 1000`;
    
    // Get all categories
    const categories = await sql`SELECT DISTINCT category FROM emojis WHERE category IS NOT NULL ORDER BY category`;
    
    // Build sitemap XML with proper escaping
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `\n  <url>\n    <loc>https://www.kitmoji.net${page.url}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`;
    });

    // Add category pages
    categories.rows.forEach(row => {
      try {
        const categorySlug = row.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (categorySlug && categorySlug.length > 0) {
          sitemap += `\n  <url>\n    <loc>https://www.kitmoji.net/category/${categorySlug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
        }
      } catch (err) {
        console.warn('Skipped category:', row.category, err.message);
      }
    });

    // Add individual emoji pages (limited for now to prevent errors)
    let addedEmojis = 0;
    emojis.rows.forEach(row => {
      try {
        const emojiSlug = generateEmojiSlug(row.name);
        if (emojiSlug && emojiSlug.length > 0 && addedEmojis < 1000) {
          sitemap += `\n  <url>\n    <loc>https://www.kitmoji.net/emoji/${emojiSlug}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
          addedEmojis++;
        }
      } catch (err) {
        console.warn('Skipped emoji:', row.name, err.message);
      }
    });

    sitemap += '\n</urlset>';

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    res.send(sitemap);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

module.exports = { generateSitemap };