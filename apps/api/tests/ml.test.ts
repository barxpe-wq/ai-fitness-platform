import { describe, it, expect } from "vitest";
import http from "node:http";
import request from "supertest";
import { app } from "../src/app";
import { loginTrainer } from "./helpers";

function startMockMlServer(port: number) {
  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.statusCode = 404;
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method === "POST" && req.url === "/predict-weight") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ predicted_weight_kg: 82.5 }));
      return;
    }

    res.statusCode = 404;
    res.end();
  });

  return new Promise<http.Server>((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

describe("ml", () => {
  it("proxies ML health", async () => {
    const port = 5055;
    const server = await startMockMlServer(port);

    const token = await loginTrainer();
    const response = await request(app)
      .get("/ml/health")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    await new Promise((resolve) => server.close(resolve));
  });
});
