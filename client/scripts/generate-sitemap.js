import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = process.env.SITE_URL || 'https://voya.travel';
const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

const STATIC_ROUTES = ['/', '/trips', '/destinations', '/about', '/contact'];

async function main() {
  const res = await fetch(`${API_URL}/trips?limit=500`);
  const { trips = [] } = await res.json();

  const urls = [
    ...STATIC_ROUTES.map(route => ({ loc: `${SITE_URL}${route}`, priority: route === '/' ? '1.0' : '0.7' })),
    ...trips.map(t => ({ loc: `${SITE_URL}/trips/${t.slug}`, priority: '0.9' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>
`;

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml);
  console.log(`Sitemap written to ${outPath} with ${urls.length} URLs`);
}

main().catch(err => {
  console.error('Failed to generate sitemap:', err.message);
  process.exit(1);
});
