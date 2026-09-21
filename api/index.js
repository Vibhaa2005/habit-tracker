// Vercel Serverless Function entrypoint. Every /api/* request is routed here
// (Vercel's zero-config Node builder detects any file under /api and treats
// an exported Express app as its request handler) and delegated straight to
// the same Express app that runs locally via `server/src/index.js`.
module.exports = require('../server/src/app');
