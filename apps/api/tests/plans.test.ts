import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { loginTrainer } from "./helpers";

async function createClient(token: string) {
  const response = await request(app)
    .post("/clients")
    .set("Authorization", `Bearer ${token}`)
    .send({
      email: "planclient@demo.com",
      tempPassword: "Temp1234!",
      firstName: "Jan",
      lastName: "Nowak"
    });
  return response.body.id as string;
}

describe("plans", () => {
  it("creates, updates, and deletes plan", async () => {
    const token = await loginTrainer();
    const clientId = await createClient(token);

    const create = await request(app)
      .post(`/clients/${clientId}/plans`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Plan A", notes: "Start" });

    expect(create.status).toBe(201);

    const list = await request(app)
      .get(`/clients/${clientId}/plans`)
      .set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);

    const update = await request(app)
      .patch(`/plans/${create.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Plan B" });
    expect(update.status).toBe(200);
    expect(update.body.title).toBe("Plan B");

    const del = await request(app)
      .delete(`/plans/${create.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);
    expect(del.body.ok).toBe(true);
  });
});
