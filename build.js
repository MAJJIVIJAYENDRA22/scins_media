// =============================================================================
// SCINSMEDIA — Universal Build Script (CommonJS & ESM compatible)
// =============================================================================
const fs = require('fs');
const path = require('path');
const { build: esbuildBuild } = require('esbuild');

async function run() {
  const isExplicitBuild =
    process.env.npm_lifecycle_event === 'build' ||
    process.argv.includes('--force') ||
    process.env.FORCE_BUILD === 'true';

  const hasPrebuilt =
    fs.existsSync('dist/index.html') &&
    fs.existsSync('dist/server.cjs') &&
    fs.existsSync('dist/assets');

  const isCloudOrProd =
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RAILWAY_STATIC_URL) ||
    Boolean(process.env.CI) ||
    Boolean(process.env.PASSENGER_APP_ENV) ||
    process.env.NODE_ENV === 'production';

  if (!isExplicitBuild && hasPrebuilt && isCloudOrProd) {
    console.log('[build] Verified pre-built production assets in dist/. Skipping heavy memory compilation for fast, reliable deployment.');
    return;
  }

  console.log('[build] Compiling client application with Vite...');
  const { build: viteBuild } = await import('vite');
  await viteBuild();

  console.log('[build] Bundling server application with esbuild...');
  await esbuildBuild({
    entryPoints: ['server.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    sourcemap: true,
    outfile: 'dist/server.cjs'
  });

  try {
    fs.copyFileSync('dist/server.cjs', 'dist/server.js');
  } catch (err) {
    console.warn('[build] Copy notice:', err.message);
  }

  try {
    const pubUploads = path.join(__dirname, 'public', 'uploads');
    const distUploads = path.join(__dirname, 'dist', 'uploads');
    if (!fs.existsSync(distUploads)) fs.mkdirSync(distUploads, { recursive: true });
    if (fs.existsSync(pubUploads)) {
      const files = fs.readdirSync(pubUploads);
      for (const file of files) {
        const src = path.join(pubUploads, file);
        const dest = path.join(distUploads, file);
        if (fs.statSync(src).isFile() && !fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
        }
      }
    }
  } catch (err) {
    console.warn('[build] Uploads mirror notice:', err.message);
  }

  console.log('[build] Production build completed successfully!');
}

run().catch((err) => {
  console.error('[build error]:', err);
  process.exit(1);
});
