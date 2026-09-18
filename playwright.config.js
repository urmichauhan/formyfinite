import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    screenshot: "only-on-failure",
  },
  workers: 1,
  reporter: "list",
  webServer: {
    command: "node scripts/demo.js",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: true,
    timeout: 180000,
  },
});
