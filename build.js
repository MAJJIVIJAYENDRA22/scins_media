// =============================================================================
// SCINSMEDIA — Universal Build Script (CommonJS & ESM compatible)
// =============================================================================
const fs = require('fs');
const path = require('path');
const { build: esbuildBuild } = require('esbuild');

async function run() {
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

  if (hasPrebuilt && (isCloudOrProd || process.env.FORCE_BUILD !== 'true')) {
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

  console.log('[build] Production build completed successfully!');
}

run().catch((err) => {
  console.error('[build error]:', err);
  process.exit(1);
});
