import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

/**
 * Two suites, two runtimes.
 *
 * The app renders components and needs jsdom; the `me-ui` CLI reads and writes
 * real files and needs plain node. Splitting them into projects is what puts the
 * CLI's tests inside `bun run test` — while they lived outside the include
 * pattern, CI reported green without ever exercising the package being published.
 */
export default defineConfig({
  test: {
    projects: [
      {
        // The SWC variant is used instead of the Babel one because the Babel plugin
        // now peers on @babel/core@8 while the project already resolves @babel/core@7
        // through shadcn — the two cannot coexist.
        plugins: [react()],
        resolve: {
          // Resolves the `@/*` alias from tsconfig; replaces the vite-tsconfig-paths plugin.
          tsconfigPaths: true,
        },
        test: {
          name: "app",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          css: false,
        },
      },
      {
        test: {
          name: "cli",
          environment: "node",
          globals: true,
          include: ["packages/*/test/**/*.test.js"],
        },
      },
    ],
    coverage: {
      include: ["src/**/*.{ts,tsx}", "packages/*/src/**/*.js"],
      exclude: ["src/**/*.{test,spec}.{ts,tsx}", "src/app/**/layout.tsx"],
      // A ratchet, not a target: set just under what the suite covers today so
      // the number can only go up. Raise these when it does — a threshold left
      // far below reality stops reporting anything.
      thresholds: { statements: 75, branches: 65, functions: 70, lines: 75 },
    },
  },
});
