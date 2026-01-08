import request from "supertest";
import { app } from "../src/app";

export async function loginTrainer() {
  const response = await request(app)
    .post("/auth/login")
    .send({ email: "trainer@demo.com", password: "Demo1234!" });

  return response.body.accessToken as string;
}
