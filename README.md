# غلاديو مصر على Render — نسخة مستقلة وظيفيًا

This deployment mirrors the 216 canonical pages and public resources of the Vercel site (218 public localized routes), and runs its **own admin CMS backend** and **own Render Postgres database**.

- Fully functional CMS routes: /api/admin/status, setup, login, me, logout, content, item (POST/PUT/DELETE), settings (GET/PUT), change-password, verification upload, export, import.
- Public published content: /api/content, /api/post, /ar/posts/:slug, /en/posts/:slug, plus /api/search and /api/health.
- Admin UI: /admin/ (the same original public admin HTML and JavaScript copied from Vercel).
- Passwords hashed using scrypt; sessions use HttpOnly Secure SameSite=Strict cookies and hashed database tokens.
- Source material and public archives are copied at **build time**, not continuously.
- Private data and original Vercel admin passwords, sessions, drafts, and Blob storage are **not migrated automatically** and are **not shared**; use authenticated export/import for private CMS records.
- Canonical/robots remains directed to the Vercel site; Render's copy remains noindex to protect SEO.

## Before opening admin

Link a private Render Postgres connection string through `DATABASE_URL`. Configure a cryptographically random one-time `GLADIO_BOOTSTRAP_CODE` in Render secrets, then open /admin/ and set up your **new Render administrator**. Admin setup is disabled permanently as soon as one administrator exists.

## Free tier retention warning

Render Free Postgres expires **30 days after creation** and cannot be used as durable production storage; no automatic backups are provided. **Export data before expiration, upgrade the datastore, or migrate to a durable external database.** No paid plan was enabled here.

This isolated Git branch is not the `main` branch of the enclosing GitHub repository.
