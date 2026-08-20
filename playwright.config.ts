import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/**
 * End-to-end coverage exists for one reason: the occupation control is a Base UI
 * popup, and jsdom cannot position it. The unit suite says so out loud and fills
 * that field through the form context instead — which leaves the real control
 * untested everywhere else. A browser is the only place that gap closes.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The production build, not `dev`: the CSP proxy and the dynamic render are
    // part of what is under test, and dev-only allowances would mask a break.
    // CI has already run `build` as its own step, so it only needs the server.
    command: process.env.CI
      ? `bun run start --port ${PORT}`
      : `bun run build && bun run start --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
