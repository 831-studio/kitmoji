// Script to generate a comprehensive static sitemap
const fs = require('fs');
const path = require('path');

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

  // Add some popular emoji pages for testing
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
  console.log(`✅ Generated sitemap with ${5 + popularEmojis.length + categories.length} pages`);
  console.log(`📍 Saved to: ${sitemapPath}`);
}

// Run if called directly
if (require.main === module) {
  generateStaticSitemap().catch(console.error);
}

module.exports = { generateStaticSitemap };