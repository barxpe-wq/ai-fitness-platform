import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { execa } from "execa";
import { beforeAll, beforeEach, afterAll } from "vitest";
import { prisma } from "../src/db";
import { Role } from "@prisma/client";

const apiRoot = new URL("..", import.meta.url).pathname;
const globalForTests = globalThis as typeof globalThis & { __dbSetup?: boolean };

process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aifitness_test?schema=public";
process.env.ML_API_BASE_URL =
  process.env.ML_API_BASE_URL ?? "http://127.0.0.1:5055";

async function seedTrainer() {
  const passwordHash = await bcrypt.hash("Demo1234!", 10);
  await prisma.user.upsert({
    where: { email: "trainer@demo.com" },
    update: { passwordHash, role: Role.TRAINER },
    create: {
      email: "trainer@demo.com",
      passwordHash,
      role: Role.TRAINER
    }
  });
}

beforeAll(async () => {
  if (globalForTests.__dbSetup) {
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for tests");
  }

  const url = new URL(databaseUrl);
  const databaseName = url.pathname.replace("/", "");
  url.pathname = "/postgres";
  const adminUrl = url.toString();

  const sql = `CREATE DATABASE "${databaseName}";`;

  const sqlFile = join(tmpdir(), `create-db-${Date.now()}.sql`);
  writeFileSync(sqlFile, sql);

  try {
    await execa("npx", ["prisma", "db", "execute", "--url", adminUrl, "--file", sqlFile], {
      cwd: apiRoot,
      stdio: "pipe",
      env: process.env
    });
  } catch {
    // Ignore create-db errors (database may already exist).
  }

  rmSync(sqlFile, { force: true });

  const delays = [500, 1000, 2000, 3000, 5000];
  let lastError: unknown;
  for (let attempt = 1; attempt <= delays.length; attempt += 1) {
    try {
      await execa("npx", ["prisma", "migrate", "deploy"], {
        cwd: apiRoot,
        stdio: "inherit",
        env: process.env
      });
      lastError = undefined;
      break;
    } catch (error) {
      lastError = error;
      console.warn(
        `migrate deploy attempt ${attempt}/${delays.length} failed: ${String(error)}`
      );
      if (attempt < delays.length) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt - 1]));
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  globalForTests.__dbSetup = true;
});

beforeEach(async () => {
  await prisma.checkIn.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.clientProfile.deleteMany();
  await prisma.user.deleteMany();
  await seedTrainer();
});

afterAll(async () => {
  await prisma.$disconnect();
});
