import { defineConfig, devices } from "@playwright/test";

// .env.test holds real per-machine test credentials (gitignored) — load it into
// process.env so ADMIN_USER picks up real values.
try {
  process.loadEnvFile(".env.test");
} catch {
  // .env.test not present — helpers fall back to their hardcoded defaults where they have one.
}

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/globalSetup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 2,
  // next dev on-demand-compiles each route on first hit; with 2 parallel workers,
  // the first tests to reach a not-yet-compiled admin route can exceed a 30s
  // default before the page finishes loading. Learned the hard way on Naturals.
  timeout: 60000,
  reporter: [["html", { outputFolder: "tests/report" }], ["list"]],
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
