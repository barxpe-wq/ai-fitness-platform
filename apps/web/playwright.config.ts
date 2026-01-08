import { defineConfig } from "@playwright/test";

const webPort = 3000;
const apiPort = 4000;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: `http://localhost:${webPort}`
  },
  webServer: [
    {
      command: "npm run dev --workspace apps/api",
      port: apiPort,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: String(apiPort),
        DATABASE_URL: process.env.DATABASE_URL ?? "",
        JWT_SECRET: process.env.JWT_SECRET ?? "dev_super_secret_change_me",
        CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000"
      }
    },
    {
      command: "npm run dev --workspace apps/web",
      port: webPort,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_BASE_URL: `http://localhost:${apiPort}`
      }
    }
  ]
});
