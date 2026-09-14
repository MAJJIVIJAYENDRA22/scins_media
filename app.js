// =============================================================================
// SCINSMEDIA — GoDaddy cPanel / Phusion Passenger Node.js Startup Wrapper
// =============================================================================
// When deploying via GoDaddy cPanel "Setup Node.js App", you can set
// the "Application startup file" to either "app.js" or "dist/server.cjs".
// This file ensures that default "app.js" startup immediately boots the production engine.

require('./dist/server.cjs');
