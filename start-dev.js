#!/usr/bin/env node
// =============================================================================
// SCINSMEDIA — Universal Development & Cloud Startup Runner / tsx Shim
// =============================================================================
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distServer = path.join(__dirname, 'dist', 'server.cjs');

async function main() {
  if (fs.existsSync(distServer)) {
    console.log('[start-dev] Starting compiled enterprise server (dist/server.cjs)...');
    await import('./dist/server.cjs');
    return;
  }

  console.log('[start-dev] dist/server.cjs missing, launching local dev server with tsx...');
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
