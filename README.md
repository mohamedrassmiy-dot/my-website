# Gladio Egypt — Render Free Mirror

This branch is intentionally isolated from the `main` branch.

**Primary canonical site:** https://gladio-egypt.vercel.app/

The Render instance snapshots all public Arabic/English pages from the primary site's sitemap at build time. It retains an independent local copy of the public frontend and a small Node.js API for read-only search and health status. All Render HTML pages include `noindex,follow`, a canonical to the Vercel page, and HTTP `X-Robots-Tag`, so this secondary deployment does not compete with the primary site in search.

The administrative interface redirects securely to the primary Vercel website. There are **no copied credentials, sessions, databases, or independent editing APIs** in this branch.

Render deployment:
- Service: Web Service / Node.js / Free / Frankfurt.
- Build command: `npm run build`.
- Start command: `npm start`.
- Health check: `/healthz`.
- Routes: `/ar/`, `/en/`, `/ar/legacy-blog/`, `/api/search?q=...`.
- The public snapshot refreshes when the Render service is rebuilt; no background auto-sync is promised.

Public historical allegations and interpretations are attributed to their sources; they are not independently verified by the deployment process.
