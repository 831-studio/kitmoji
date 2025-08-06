// Vercel serverless function for comprehensive sitemap
import { sql } from '@vercel/postgres';

// Helper function to generate emoji slug consistently
const generateEmojiSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[:\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export default async function handler(req, res) {
  try {
    const now = new Date().toISOString();
    
    // Static pages
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

    // Get all categories
    const categories = await sql`SELECT DISTINCT category FROM emojis WHERE category IS NOT NULL ORDER BY category`;
    
    // Add category pages
    categories.rows.forEach(row => {
      const categorySlug = row.category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (categorySlug && categorySlug.length > 0) {
        sitemap += `
  <url>
    <loc>https://www.kitmoji.net/category/${categorySlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    });

    // Get all emojis for individual pages
    const emojis = await sql`SELECT name FROM emojis ORDER BY id`;
    
    // Add individual emoji pages
    emojis.rows.forEach(row => {
      const emojiSlug = generateEmojiSlug(row.name);
      if (emojiSlug && emojiSlug.length > 0) {
        sitemap += `
  <url>
    <loc>https://www.kitmoji.net/emoji/${emojiSlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    });

    sitemap += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.status(200).send(sitemap);
    
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Fallback to static sitemap if database fails
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.kitmoji.net/</loc>
    <lastmod>2025-08-06T03:36:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).send(fallbackSitemap);
  }
}