import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";

const loginPayload = { email: "trainer@demo.com", password: "Demo1234!" };

describe("auth", () => {
  it("logs in trainer", async () => {
    const response = await request(app).post("/auth/login").send(loginPayload);
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe(loginPayload.email);
  });

  it("rejects /me without token", async () => {
    const response = await request(app).get("/auth/me");
    expect(response.status).toBe(401);
  });

  it("returns /me with token", async () => {
    const login = await request(app).post("/auth/login").send(loginPayload);
    const token = login.body.accessToken as string;

    const response = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(loginPayload.email);
  });
});
