const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing SEO setup on http://localhost:3000 ...\n');

  // 1. Robots.txt
  const r = await get('http://localhost:3000/robots.txt');
  console.log('1. /robots.txt Status:', r.status, 'Content-Type:', r.headers['content-type']);
  console.log('--- Body ---');
  console.log(r.body.trim());
  console.log('------------\n');

  // 2. Sitemap.xml
  const s = await get('http://localhost:3000/sitemap.xml');
  console.log('2. /sitemap.xml Status:', s.status, 'Content-Type:', s.headers['content-type']);
  console.log('Sitemap contains <urlset>:', s.body.includes('<urlset'));
  console.log('Sitemap contains conferences:', s.body.includes('/conferences/'));
  console.log('Sitemap size:', s.body.length, 'bytes\n');

  // 3. HTML Document
  const h = await get('http://localhost:3000/');
  console.log('3. Homepage Status:', h.status);
  const title = h.body.match(/<title>([^<]+)<\/title>/)?.[1];
  console.log('Title:', title);
  const desc = h.body.match(/<meta name="description" content="([^"]+)"/)?.[1];
  console.log('Description:', desc);
  const robots = h.body.match(/<meta name="robots" content="([^"]+)"/)?.[1];
  console.log('Robots:', robots);
  const canonical = h.body.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  console.log('Canonical:', canonical);
  const ogTitle = h.body.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
  console.log('OG Title:', ogTitle);
  const ogImage = h.body.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  console.log('OG Image:', ogImage);
  const twCard = h.body.match(/<meta name="twitter:card" content="([^"]+)"/)?.[1];
  console.log('Twitter Card:', twCard);
  console.log('Schema.org JSON-LD present:', h.body.includes('application/ld+json'));
}

run().catch(console.error);
