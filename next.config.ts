import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

/**
 * Applied to every response. `Content-Security-Policy` is *not* here on purpose:
 * a useful policy needs a fresh per-request nonce, which a static header list
 * cannot express. It is generated in `src/proxy.ts` instead.
 */
const securityHeaders = [
  // Only honoured over HTTPS; ignored on localhost.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
  webpack: (config, { isServer }) => {
    if (isServer) return config;

    // Merged into whatever Next already configured rather than replacing it:
    // a bare assignment would drop Next's own `framework` cache group and put
    // React back into the app bundle.
    const existing =
      typeof config.optimization.splitChunks === "object" ? config.optimization.splitChunks : {};

    config.optimization.splitChunks = {
      ...existing,
      chunks: "all",
      maxInitialRequests: 25,
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        ...(existing.cacheGroups ?? {}),
        defaultVendors: {
          // Both separators: module paths use `\` on Windows, so a `/`-only
          // character class silently matches nothing there and no vendor chunk
          // is ever emitted.
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
          priority: 20,
          reuseExistingChunk: true,
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 10,
          reuseExistingChunk: true,
        },
      },
    };

    return config;
  },
};

// Bundle Analysis için konfigrasyon — `npm run analyze` ile rapor üretilir.
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  // Reports are written to .next/analyze/*.html instead of opening browser tabs,
  // so the command is usable in CI and does not hijack the desktop.
  openAnalyzer: false,
})(nextConfig);
