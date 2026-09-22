// Vercel Serverless Function entrypoint. Every request under /api/* is
// forwarded here by an explicit rewrite in vercel.json ("/api/(.*)" ->
// "/api"), rather than relying on Vercel's [...catchAll] filename
// convention, which turned out not to match nested paths (e.g.
// /api/day/2026-09-22) reliably in this project. Rewrites preserve the
// original req.url for the function, so Express's own routing in
// server/src/app.js (app.get('/api/settings', ...) etc.) still works as-is.
module.exports = require('../server/src/app');
