// =============================================================================
// SCINSMEDIA — GoDaddy cPanel Phusion Passenger Startup File
// =============================================================================
const path = require('path');
const fs = require('fs');

// Ensure .env is explicitly loaded from the application root directory under Passenger
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    require('dotenv').config({ path: envPath });
  } catch (e) {
    // dotenv will be loaded by server
  }
}

const distServer = path.join(__dirname, 'dist', 'server.cjs');
require(distServer);

