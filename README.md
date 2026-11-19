# Gladio Egypt — Netlify free mirror

This is a **separate Git branch** for Netlify. It does not replace the `main` branch or the Render deployment.

## One-click deployment

[Deploy to Netlify](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fmohamedrassmiy-dot%2Fmy-website&branch=deploy%2Fgladio-egypt-netlify)

Select the **Ali / mohamed-rassmiy** Netlify team and its Free plan if prompted.

## How it works

- The build fetches the current `https://gladio-egypt.vercel.app/sitemap.xml`, all Arabic and English public HTML pages, styles, scripts and public sources, and creates a static snapshot in `dist/`.
- Netlify Functions provide a read-only search API at `/api/search`, `/api/entries`, and health/status at `/api/health`, `/healthz` and `/api/mirror-status`.
- All HTML retains canonical references to Vercel and contains `noindex,follow` to prevent duplicated search results. Netlify also sets `X-Robots-Tag: noindex`.
- Visiting `/admin/` redirects to the original secure administrative system at Vercel. This branch does **not** duplicate credentials, session cookies, Postgres, CMS write access, or sensitive private data.
- Public data is refreshed when Netlify rebuilds from the Git branch, not continuously. The site remains useful as a public snapshot if Vercel later goes offline.
- Build checks that the source sitemap is a reasonable size and that both languages have public pages.

**Deployment status:** Prepared, requires an authorized Netlify Git import. A working published URL must only be claimed after Netlify reports a successful production deploy and HTTP checks pass.

**Note:** The public historical material may contain contested claims. Publishing a copy does not turn such claims into independently verified facts.
