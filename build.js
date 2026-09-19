import { build as viteBuild } from 'vite';
import { build as esbuildBuild } from 'esbuild';
import fs from 'fs';

async function run() {
  const hasPrebuilt =
    fs.existsSync('dist/index.html') &&
    fs.existsSync('dist/server.cjs') &&
    fs.existsSync('dist/assets');

  const isCloudOrProd =
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RAILWAY_STATIC_URL) ||
    Boolean(process.env.CI) ||
    process.env.NODE_ENV === 'production';

  // If pre-built assets already exist in git and we are in cloud or FORCE_BUILD is not enabled,
  // skip heavy Vite compilation to prevent 512MB RAM Out-Of-Memory (SIGKILL) crashes on Render free tier.
  if (hasPrebuilt && (isCloudOrProd || process.env.FORCE_BUILD !== 'true')) {
    console.log('[build] Verified pre-built production assets in dist/. Skipping heavy memory compilation for fast, reliable cloud deployment.');
    return;
  }

  console.log('[build] Compiling client application with Vite...');
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
