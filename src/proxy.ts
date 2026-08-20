import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request Content Security Policy.
 *
 * Next 16 renamed Middleware to Proxy; this is the only place a fresh nonce can
 * be minted per request, which is why the CSP is not in `next.config.ts` with
 * the other security headers.
 *
 * Cost of this choice: nonces are injected during server rendering, so every
 * page must render dynamically — static optimization and CDN caching are off.
 * The quote flow is per-applicant and uncacheable anyway, and it collects a
 * national id, so a strict policy is worth the trade.
 */
const ANALYTICS_ORIGIN = originOf(process.env.NEXT_PUBLIC_WEB_VITALS_URL);

function originOf(url: string | undefined) {
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

function policyFor(nonce: string, isDev: boolean) {
  return [
    `default-src 'self'`,
    // `strict-dynamic` lets the nonced bootstrap load the rest of the bundle.
    // React needs `eval` in development to rebuild server stacks; not in prod.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    // Base UI positions the select popup and tooltips with inline `style`
    // attributes, and a nonce never applies to a style *attribute* — only to
    // <style> elements. Without this the dropdown and hints render unpositioned.
    `style-src-attr 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self'${ANALYTICS_ORIGIN ? ` ${ANALYTICS_ORIGIN}` : ""}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const policy = policyFor(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
}

export const config = {
  matcher: [
    {
      // Static assets, metadata routes and prefetches do not need the header,
      // and skipping them keeps a nonce from being minted for requests that
      // never render HTML.
      source: "/((?!_next/static|_next/image|favicon.ico|assets|fonts|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
