import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  ML_API_BASE_URL: z.string().min(1).default("http://localhost:8000")
});

const env = envSchema.parse({
  PORT: process.env.PORT ?? "4000",
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  ML_API_BASE_URL: process.env.ML_API_BASE_URL ?? "http://localhost:8000"
});

export const config = {
  port: env.PORT,
  jwtSecret: env.JWT_SECRET,
  corsOrigin: env.CORS_ORIGIN,
  mlApiBaseUrl: env.ML_API_BASE_URL
};
