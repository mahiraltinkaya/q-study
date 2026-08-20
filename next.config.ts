import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const securityHeaders = [
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

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
})(nextConfig);
