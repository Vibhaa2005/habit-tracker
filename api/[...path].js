// Vercel Serverless Function entrypoint. The "[...path]" filename is Vercel's
// catch-all route convention, so every request under /api/* (e.g.
// /api/settings, /api/day/2026-09-22) is routed to this one function — a
// plain "api/index.js" only ever matches the exact path "/api" and would
// otherwise fall through to the SPA rewrite in vercel.json, which is exactly
// what was happening (API calls were getting index.html back instead of
// JSON). Express still sees the real original path via req.url, so all the
// routes defined in server/src/app.js keep working unchanged.
module.exports = require('../server/src/app');
