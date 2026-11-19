# Gladio Egypt — Cloudflare Workers + Static Assets mirror

**Canonical primary:** https://gladio-egypt.vercel.app/

Cloudflare project in the user's screenshot: **my-website** (a Worker, not a Pages project). Its Git deployment initially failed because `npx wrangler deploy` did not find a directory containing static assets. This branch fixes that with `wrangler.jsonc` + `src/worker.js` and builds `dist/` from public source pages.

## Fix existing failed Cloudflare project

Open **Cloudflare → Workers & Pages → my-website → Settings → Builds**.

- Repository: `mohamedrassmiy-dot/my-website`
- **Production Git branch:** `deploy/gladio-egypt-cloudflare` — not `main`.
- Root directory: repository root.
- **Deploy command:** `npm run deploy` (builds the snapshot, checks its output, then calls the pinned Wrangler).
- Build command: leave empty if using `npm run deploy`, to avoid building the same snapshot twice.
- Worker name: `my-website`, matching `wrangler.jsonc`.

Save, then select **Retry build** or push a new commit on the production branch.

Alternatively, leave the default Deploy command `npx wrangler deploy`, but then set **Build command** to `npm run build`. The snapshot must be built before the deploy command. Cloudflare Workers Git Builds currently does not honor Wrangler's custom `build.command`, so set this in the dashboard.

When live, use the Cloudflare-provided `workers.dev` URL (because this is a Worker deployment, **not** `pages.dev`).

## Runtime scope

- Serves all 216 canonical public AR/EN pages plus 2 search views as a **build-time static archive** (exact count checked during build).
- Read-only APIs: `/api/health`, `/healthz`, `/api/mirror-status`, `/api/search?q=gladio`, `/api/entries`.
- Cloudflare Worker script: `src/worker.js`; Wrangler static asset directory: `./dist`.
- Noindex mirror and canonical references pointing to the primary Vercel URLs.
- `/admin/` redirects to the Vercel CMS. There are no copied passwords, sessions, private database contents, or writing endpoints.
- No permanent sync; each build snapshots the public website at build time.
- Does not touch the GitHub `main` branch or the canonical Vercel deployment.

## After deployment

Check `/ar/`, `/en/`, `/api/health` and `/api/search?q=gladio` on the actual `workers.dev` domain. Confirm that public HTML is `noindex,follow` and has a canonical to the primary site.

A successful deployment cannot be assumed from this Git branch alone. Confirm the build and deployment results in Cloudflare.
