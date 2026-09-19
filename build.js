import { build as viteBuild } from 'vite';
import { build as esbuildBuild } from 'esbuild';
import fs from 'fs';

async function run() {
  console.log('[build] Building client application with Vite...');
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
