/**
 * Canonical origin, used by the metadata routes that have to emit absolute URLs.
 * Vercel exposes the production host to every build; the localhost fallback keeps
 * `next build` working anywhere else without configuration.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/+$/, "");
