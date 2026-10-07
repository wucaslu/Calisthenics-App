import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-desktop",
  outputDir: "desktop-test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  use: { trace: "retain-on-failure" },
});
