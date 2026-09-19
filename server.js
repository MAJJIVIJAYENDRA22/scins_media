// =============================================================================
// SCINSMEDIA — GoDaddy cPanel Phusion Passenger Startup File
// =============================================================================
const path = require('path');
const distServer = path.join(__dirname, 'dist', 'server.cjs');
require(distServer);
