#!/usr/bin/env node
// =============================================================================
// SCINSMEDIA — Universal Development & Production Runner / tsx Shim (CommonJS)
// =============================================================================
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (fs.existsSync(distServer)) {
  console.log('[start-dev] Starting compiled enterprise server (dist/server.cjs)...');
  require(distServer);
} else {
  console.log('[start-dev] dist/server.cjs missing, launching local dev server with tsx...');
  const localTsxPath = path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');

  if (fs.existsSync(localTsxPath)) {
    const child = spawn(process.execPath, [localTsxPath, 'server.ts'], {
      stdio: 'inherit',
      cwd: __dirname,
      env: process.env,
    });
    child.on('exit', (code) => process.exit(code || 0));
  } else {
    const child = spawn('npx', ['tsx', 'server.ts'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
      env: process.env,
    });
    child.on('exit', (code) => process.exit(code || 0));
  }
}
