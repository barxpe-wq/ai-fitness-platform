import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { loginTrainer } from "./helpers";

describe("clients", () => {
  it("lists clients", async () => {
    const token = await loginTrainer();
    const response = await request(app)
      .get("/clients")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("creates and fetches a client", async () => {
    const token = await loginTrainer();
    const create = await request(app)
      .post("/clients")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "client99@demo.com",
        tempPassword: "Temp1234!",
        firstName: "Ewa",
        lastName: "Kowalska"
      });

    expect(create.status).toBe(201);
    expect(create.body.email).toBe("client99@demo.com");

    const getOne = await request(app)
      .get(`/clients/${create.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getOne.status).toBe(200);
    expect(getOne.body.email).toBe("client99@demo.com");
  });
});
