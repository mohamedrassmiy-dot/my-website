# Gladio Egypt — Cloudflare Pages / Free public mirror

This isolated branch is prepared for **Cloudflare Pages** and does not modify the main GitHub branch or the production site on Vercel.

## Connect and deploy

1. Visit https://dash.cloudflare.com/ and open **Workers & Pages**.
2. Create application → **Pages** → **Import an existing Git repository**.
3. Authorize **GitHub** and select `mohamedrassmiy-dot/my-website`.
4. Set **Production branch** to `deploy/gladio-egypt-cloudflare` (do **not** use `main`).
5. Choose **Framework preset**: None, **Build command**: `npm run build`, **Build output directory**: `dist`, **Root directory**: repository root.
6. Deploy on the free Pages plan and verify `/ar/`, `/en/`, `/ar/legacy-blog/`, `/api/health`, and `/api/search?q=gladio`.

The build copies current public HTML and assets from `https://gladio-egypt.vercel.app`. Around 216 canonical pages + two search views are mirrored, with original documents preserved; the exact count is verified at build time.

## Safety and SEO

- Public mirror HTML includes `noindex,follow` and canonical pointers to the Vercel URLs.
- Cloudflare `_headers` adds `X-Robots-Tag: noindex, follow`; `_routes.json` limits Functions to `/api/*` and `/healthz`.
- Pages Functions expose read-only `/api/search`, `/api/entries`, `/api/health`, `/api/mirror-status`, and `/healthz`.
- `/admin/` redirects to the Vercel CMS. This branch does not copy admin passwords, sessions, secret environment variables, database data, or writing privileges.
- Builds refresh snapshots when the branch is deployed; they are **not live replication**.
- A published Cloudflare URL must be checked after a successful deployment; this branch alone does not establish a live Cloudflare site.

## Scope

Full bilingual **public website** + read-only backend endpoints, **not** an independent administrative backend or database. This is intentional to avoid exposing unapproved private data.
