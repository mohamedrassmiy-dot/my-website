import { getStore, getDeployStore } from "@netlify/blobs";
import sanitizeHtml from "sanitize-html";
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { DEFAULT_STATE } from "./seed.mts";

const STORE_NAME = "business-owner-cms";
const SESSION_COOKIE = "bo_cms_session";

export function env(name: string): string {
  return String((globalThis as any).Netlify?.env?.get(name) || "");
}

export function cmsStore() {
  const context = (globalThis as any).Netlify?.context?.deploy?.context;
  return context === "production"
    ? getStore(STORE_NAME, { consistency: "strong" })
    : getDeployStore(STORE_NAME);
}

export async function loadState(): Promise<any> {
  const store = cmsStore();
  let state = await store.get("state", { type: "json" });
  if (!state) {
    state = structuredClone(DEFAULT_STATE);
    await store.setJSON("state", state);
  }
  return state;
}

export async function saveState(state: any) {
  state.version = Number(state.version || 0) + 1;
  await cmsStore().setJSON("state", state);
}

export function json(data: any, status = 200, headers: Record<string,string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers }
  });
}

export function html(body: string, status = 200, headers: Record<string,string> = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...headers }
  });
}

export function text(body: string, status = 200, contentType = "text/plain; charset=utf-8", headers: Record<string,string> = {}) {
  return new Response(body, { status, headers: { "content-type": contentType, ...headers } });
}

export function slugify(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 140);
}

export function sanitizeContent(value: string) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [
      "p","br","h1","h2","h3","h4","h5","h6","strong","b","em","i","u","s",
      "ul","ol","li","blockquote","a","img","figure","figcaption","hr","code","pre",
      "table","thead","tbody","tr","th","td","div","span"
    ],
    allowedAttributes: {
      a: ["href","target","rel","title"],
      img: ["src","alt","title","width","height","loading"],
      "*": ["class","id","dir","lang"]
    },
    allowedSchemes: ["http","https","mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }, true)
    }
  });
}

export function cleanContentItem(input: any, type: string) {
  const now = new Date().toISOString();
  const title = String(input?.title || "").trim().slice(0, 220);
  const slug = slugify(input?.slug || title);
  return {
    id: String(input?.id || `${type}-${randomUUID()}`),
    type,
    lang: input?.lang === "ar" ? "ar" : "en",
    status: ["draft","published","scheduled","trash"].includes(input?.status) ? input.status : "draft",
    category: String(input?.category || "").slice(0, 100),
    title,
    slug,
    excerpt: String(input?.excerpt || "").trim().slice(0, 500),
    content: sanitizeContent(input?.content || ""),
    featured_image: String(input?.featured_image || "").slice(0, 1000),
    author: String(input?.author || "Business Owner").slice(0, 120),
    published_at: input?.published_at || now,
    scheduled_at: input?.scheduled_at || "",
    updated_at: now,
    seo_title: String(input?.seo_title || title).slice(0, 220),
    meta_description: String(input?.meta_description || input?.excerpt || "").slice(0, 320),
    focus_keyword: String(input?.focus_keyword || "").slice(0, 120),
    secondary_keywords: String(input?.secondary_keywords || "").slice(0, 500),
    canonical: String(input?.canonical || "").slice(0, 1000),
    robots_index: input?.robots_index !== false,
    robots_follow: input?.robots_follow !== false,
    og_title: String(input?.og_title || title).slice(0, 220),
    og_description: String(input?.og_description || input?.meta_description || input?.excerpt || "").slice(0, 320),
    og_image: String(input?.og_image || input?.featured_image || "").slice(0, 1000)
  };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, encoded: string) {
  try {
    const [kind, salt, expectedHex] = String(encoded || "").split("$");
    if (kind !== "scrypt" || !salt || !expectedHex) return false;
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function sessionSecret() {
  return env("CMS_SESSION_SECRET");
}

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSession(user: any) {
  const payload = b64url(JSON.stringify({
    sub: user.id,
    email: user.email,
    role: user.role || "editor",
    csrf: randomBytes(18).toString("base64url"),
    exp: Date.now() + 1000 * 60 * 60 * 12
  }));
  return `${payload}.${sign(payload)}`;
}

export function sessionCookie(token: string, clear = false) {
  const maxAge = clear ? "0" : String(60 * 60 * 12);
  return `${SESSION_COOKIE}=${clear ? "" : token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function cookieValue(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return "";
}

export function verifySession(req: Request): any | null {
  const token = cookieValue(req, SESSION_COOKIE);
  if (!token || !sessionSecret()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data?.sub || Number(data.exp || 0) < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function assertSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(req.url).origin;
}

export function clientIp(req: Request) {
  return String(req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "unknown")
    .split(",")[0].trim().slice(0, 80);
}

export function recordActivity(state: any, actor: any, action: string, detail = "") {
  state.activity = Array.isArray(state.activity) ? state.activity : [];
  state.activity.unshift({
    id: randomUUID(),
    at: new Date().toISOString(),
    actor: actor?.email || "system",
    role: actor?.role || "system",
    action: String(action).slice(0, 100),
    detail: String(detail).slice(0, 500)
  });
  state.activity = state.activity.slice(0, 500);
}

export function recordSecurity(state: any, req: Request, type: string, severity = "medium", detail = "") {
  state.security_events = Array.isArray(state.security_events) ? state.security_events : [];
  state.security_events.unshift({
    id: randomUUID(),
    at: new Date().toISOString(),
    type: String(type).slice(0, 100),
    severity: String(severity).slice(0, 20),
    ip: clientIp(req),
    path: new URL(req.url).pathname.slice(0, 250),
    user_agent: String(req.headers.get("user-agent") || "").slice(0, 300),
    detail: String(detail).slice(0, 500)
  });
  state.security_events = state.security_events.slice(0, 500);
}

export async function snapshotState(state: any, reason: string, actor: any) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const key = `backup/${stamp}-${randomUUID()}`;
  await cmsStore().setJSON(key, {
    created_at: new Date().toISOString(),
    reason: String(reason).slice(0, 200),
    actor: actor?.email || "system",
    state
  });
  const listing = await cmsStore().list({ prefix: "backup/" });
  const old = listing.blobs.sort((a,b) => a.key.localeCompare(b.key)).slice(0, Math.max(0, listing.blobs.length - 20));
  for (const item of old) await cmsStore().delete(item.key);
}

export async function currentUser(req: Request, state?: any) {
  const session = verifySession(req);
  if (!session) return null;
  if (session.sub === "env-admin") {
    return { id: "env-admin", email: env("CMS_ADMIN_EMAIL"), role: "administrator", name: "Administrator", csrf: session.csrf };
  }
  const s = state || await loadState();
  const user = (s.users || []).find((u: any) => u.id === session.sub && u.status !== "disabled");
  return user ? { ...user, csrf: session.csrf } : null;
}

export async function requireUser(req: Request, roles: string[] = ["administrator","editor"]) {
  const state = await loadState();
  const user = await currentUser(req, state);
  if (!user || !roles.includes(user.role)) return { ok: false, state, user: null, response: json({ error: "Unauthorized" }, 401) };
  return { ok: true, state, user, response: null };
}

export function isPublishable(item: any) {
  if (item?.status === "published") return true;
  if (item?.status === "scheduled" && item?.scheduled_at) {
    return new Date(item.scheduled_at).getTime() <= Date.now();
  }
  return false;
}

export function escapeHtml(value: any) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" } as any)[c]);
}
