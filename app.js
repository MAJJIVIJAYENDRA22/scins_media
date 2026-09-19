// =============================================================================
// SCINSMEDIA — Production Node.js Startup Wrapper
// =============================================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(distServer)) {
  console.log('[app.js] Pre-compiling production bundle...');
  execSync('node build.js', { stdio: 'inherit', cwd: __dirname });
}

import('./dist/server.cjs');
