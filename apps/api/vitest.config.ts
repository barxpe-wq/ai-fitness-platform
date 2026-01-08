import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    sequence: {
      concurrent: false
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    hookTimeout: 20000
  }
});
