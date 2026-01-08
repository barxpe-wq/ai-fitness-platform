import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { loginTrainer } from "./helpers";

async function createClient(token: string) {
  const response = await request(app)
    .post("/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({
      email: "checkinclient@demo.com",
      tempPassword: "Temp1234!",
      firstName: "Anna",
      lastName: "Kowalska"
    });
  return response.body.id as string;
}

describe("checkins", () => {
  it("creates, updates, and deletes check-in", async () => {
    const token = await loginTrainer();
    const clientId = await createClient(token);

    const create = await request(app)
      .post(`/clients/${clientId}/checkins`)
      .set("Authorization", `Bearer ${token}`)
      .send({ date: "2025-01-05", weightKg: 82.4, waistCm: 84.1 });

    expect(create.status).toBe(201);

    const list = await request(app)
      .get(`/clients/${clientId}/checkins`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);

    const update = await request(app)
      .patch(`/checkins/${create.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ weightKg: 81.9 });
    expect(update.status).toBe(200);
    expect(update.body.weightKg).toBe(81.9);

    const del = await request(app)
      .delete(`/checkins/${create.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
    expect(del.body.ok).toBe(true);
  });
});
