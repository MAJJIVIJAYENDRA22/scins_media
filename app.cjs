// =============================================================================
// SCINSMEDIA — Production Node.js Startup Wrapper (CommonJS)
// =============================================================================
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distServer = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(distServer)) {
  console.log('[app.cjs] Pre-compiling production bundle...');
  execSync('node build.js', { stdio: 'inherit', cwd: __dirname });
}

require('./dist/server.cjs');
