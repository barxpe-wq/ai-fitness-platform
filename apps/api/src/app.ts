import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import clientsRoutes from "./routes/clients.routes";
import plansRoutes from "./routes/plans.routes";
import checkinsRoutes from "./routes/checkins.routes";
import mlRoutes from "./routes/ml.routes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/clients", clientsRoutes);
app.use(plansRoutes);
app.use(checkinsRoutes);
app.use("/ml", mlRoutes);

app.use(errorHandler);
