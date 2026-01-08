import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { verifyJWT } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { mlHealth, predictWeight } from "../services/ml.service";

const router = Router();

router.use(verifyJWT, requireRole(Role.TRAINER, Role.ADMIN));

const predictSchema = z.object({
  features: z.object({
    last_weight: z.number().min(0),
    last_waist: z.number().min(0),
    rolling_mean_7: z.number().min(0),
    rolling_mean_14: z.number().min(0),
    delta_7: z.number(),
    day_of_week: z.number().int().min(0).max(6)
  })
});

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const result = await mlHealth();
    res.json(result);
  })
);

router.post(
  "/predict-weight",
  validate({ body: predictSchema }),
  asyncHandler(async (req, res) => {
    const { features } = req.validated?.body as z.infer<typeof predictSchema>;
    const result = await predictWeight(features);
    res.json(result);
  })
);

export default router;
