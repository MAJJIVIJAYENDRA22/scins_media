// =============================================================================
// SCINSMEDIA — Universal Development & Cloud Startup Runner
// =============================================================================
import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isCloudOrProd =
  process.env.NODE_ENV === 'production' ||
  Boolean(process.env.PORT) ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.RAILWAY_STATIC_URL) ||
  Boolean(process.env.DYNO);

const distServer = path.join(__dirname, 'dist', 'server.cjs');

async function main() {
  if (isCloudOrProd || fs.existsSync(distServer)) {
    // In cloud or production environments, run the compiled production bundle
    if (!fs.existsSync(distServer)) {
      console.log('[start-dev] Production build missing. Building bundle via build.js...');
      execSync('node build.js', { stdio: 'inherit', cwd: __dirname });
    }
    console.log('[start-dev] Starting compiled enterprise server...');
    await import('./dist/server.cjs');
    return;
  }

  // Local development mode: run server.ts using tsx
  console.log('[start-dev] Starting local development server with tsx...');
  const localTsxPath = path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');

  if (fs.existsSync(localTsxPath)) {
    const child = spawn(process.execPath, [localTsxPath, 'server.ts'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: process.env,
    });
    child.on('exit', (code) => process.exit(code ?? 0));
  } else {
    const child = spawn('npx', ['tsx', 'server.ts'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
      env: process.env,
    });
    child.on('exit', (code) => process.exit(code ?? 0));
  }
}

main().catch((err) => {
  console.error('[start-dev fatal error]:', err);
  process.exit(1);
});
