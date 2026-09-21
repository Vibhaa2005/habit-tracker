# LifeOS

A personal daily operating system: routines, meals, hydration, sleep,
movement, recurring personal-care tasks, academics, and statistics — all in
one app.

- **Frontend**: React + TypeScript (Vite), Tailwind CSS, Recharts, React Router.
- **Backend**: Express (Node), a single JSON "document" as the data store.
- **Storage**: a local JSON file (`server/db.json`) in development. In
  production on Vercel, the filesystem isn't persistent, so the same document
  is stored in a Postgres row instead — see [Deploying to Vercel](#deploying-to-vercel).

## Project layout

```
client/   Vite React app (the UI)
server/   Express API + persistence logic (used for local dev)
api/      Vercel serverless entrypoint — re-exports the same Express app
```

## Running locally

Two terminals:

```bash
cd server
npm install
npm run dev      # http://localhost:4000
```

```bash
cd client
npm install
npm run dev       # http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173. Data is stored in `server/db.json`, created
automatically on first run with sensible defaults (editable later from the
Customize page).

## Deploying to Vercel

This repo is set up to deploy as a single Vercel project (static frontend +
serverless API), configured via the root `vercel.json`.

1. **Import the repo in Vercel** (New Project → pick this GitHub repo). No
   framework preset needed — `vercel.json` already declares the install/build
   commands and output directory.

2. **Add persistent storage.** Without a database, every write on Vercel
   would vanish between requests. In the Vercel dashboard: **Storage → create
   a Postgres database** (the free "Neon" integration works well) **→ Connect**
   it to this project. That automatically sets a `POSTGRES_URL` (or
   `DATABASE_URL`) environment variable, which `server/src/store.js` detects —
   no code changes needed. Redeploy after connecting it.

3. **Deploy.** Push to `main` (or click Deploy) — Vercel builds the client
   with `npm run build --prefix client` and serves `/api/*` from
   `api/index.js`, which is the same Express app used locally.

Without step 2, the app still works, but on Vercel each write may not persist
reliably across requests since there is no writable shared filesystem.
