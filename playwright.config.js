import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "browser-tests",
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
    screenshot: "only-on-failure",
  },
  reporter: "list",
  webServer: {
    command: "node tools/demo.js",
    env: { PORT: "3100" },
    url: "http://localhost:3100/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
});
