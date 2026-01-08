import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { Role } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { verifyJWT } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { assertClientAccess } from "../services/access.service";

const router = Router();

router.use(verifyJWT, requireRole(Role.TRAINER, Role.ADMIN));

const clientIdParams = z.object({
  clientId: z.string().cuid()
});

const planIdParams = z.object({
  id: z.string().cuid()
});

const createPlanSchema = z.object({
  title: z.string().min(2),
  notes: z.string().optional()
});

const updatePlanSchema = z
  .object({
    title: z.string().min(2).optional(),
    notes: z.string().nullable().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });

router.get(
  "/clients/:clientId/plans",
  validate({ params: clientIdParams }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { clientId } = req.validated?.params as z.infer<
      typeof clientIdParams
    >;

    await assertClientAccess(user, clientId);

    const plans = await prisma.plan.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" }
    });

    res.json(plans);
  })
);

router.post(
  "/clients/:clientId/plans",
  validate({ params: clientIdParams, body: createPlanSchema }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { clientId } = req.validated?.params as z.infer<
      typeof clientIdParams
    >;
    const { title, notes } = req.validated?.body as z.infer<
      typeof createPlanSchema
    >;

    await assertClientAccess(user, clientId);

    const plan = await prisma.plan.create({
      data: {
        clientId,
        title,
        notes: notes ?? ""
      }
    });

    res.status(201).json(plan);
  })
);

router.patch(
  "/plans/:id",
  validate({ params: planIdParams, body: updatePlanSchema }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { id } = req.validated?.params as z.infer<typeof planIdParams>;
    const { title, notes } = req.validated?.body as z.infer<
      typeof updatePlanSchema
    >;

    const plan = await prisma.plan.findUnique({
      where: { id }
    });

    if (!plan) {
      throw new AppError(404, "NOT_FOUND", "Plan not found");
    }

    await assertClientAccess(user, plan.clientId);

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        title: title ?? plan.title,
        notes: notes === undefined ? plan.notes : notes ?? ""
      }
    });

    res.json(updatedPlan);
  })
);

router.delete(
  "/plans/:id",
  validate({ params: planIdParams }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { id } = req.validated?.params as z.infer<typeof planIdParams>;

    const plan = await prisma.plan.findUnique({
      where: { id }
    });

    if (!plan) {
      throw new AppError(404, "NOT_FOUND", "Plan not found");
    }

    await assertClientAccess(user, plan.clientId);

    await prisma.plan.delete({
      where: { id }
    });

    res.json({ ok: true });
  })
);

export default router;
