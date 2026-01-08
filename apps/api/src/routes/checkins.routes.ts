import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { ROLES } from "../types/role";
import { AppError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { verifyJWT } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { assertClientAccess } from "../services/access.service";

const router = Router();

router.use(verifyJWT, requireRole(ROLES.TRAINER, ROLES.ADMIN));

const clientIdParams = z.object({
  clientId: z.string().cuid()
});

const checkinIdParams = z.object({
  id: z.string().cuid()
});

const createCheckinSchema = z.object({
  date: z.string().min(1),
  weightKg: z.number().optional(),
  waistCm: z.number().optional(),
  notes: z.string().optional()
});

const updateCheckinSchema = z
  .object({
    date: z.string().min(1).optional(),
    weightKg: z.number().nullable().optional(),
    waistCm: z.number().nullable().optional(),
    notes: z.string().nullable().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });

function parseDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, "VALIDATION_ERROR", "Invalid date format");
  }
  return parsed;
}

router.get(
  "/clients/:clientId/checkins",
  validate({ params: clientIdParams }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { clientId } = req.validated?.params as z.infer<
      typeof clientIdParams
    >;

    await assertClientAccess(user, clientId);

    const checkins = await prisma.checkIn.findMany({
      where: { clientId },
      orderBy: { date: "desc" }
    });

    res.json(checkins);
  })
);

router.post(
  "/clients/:clientId/checkins",
  validate({ params: clientIdParams, body: createCheckinSchema }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { clientId } = req.validated?.params as z.infer<
      typeof clientIdParams
    >;
    const { date, weightKg, waistCm, notes } =
      req.validated?.body as z.infer<typeof createCheckinSchema>;

    await assertClientAccess(user, clientId);

    const parsedDate = parseDate(date);

    try {
      const checkin = await prisma.checkIn.create({
        data: {
          clientId,
          date: parsedDate,
          weightKg,
          waistCm,
          notes
        }
      });

      res.status(201).json(checkin);
    } catch (error: unknown) {
      if (isPrismaKnownRequestError(error) && error.code === "P2002") {
        throw new AppError(409, "CONFLICT", "Check-in already exists");
      }
      throw error;
    }
  })
);

router.patch(
  "/checkins/:id",
  validate({ params: checkinIdParams, body: updateCheckinSchema }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { id } = req.validated?.params as z.infer<typeof checkinIdParams>;
    const { date, weightKg, waistCm, notes } =
      req.validated?.body as z.infer<typeof updateCheckinSchema>;

    const checkin = await prisma.checkIn.findUnique({
      where: { id }
    });

    if (!checkin) {
      throw new AppError(404, "NOT_FOUND", "Check-in not found");
    }

    await assertClientAccess(user, checkin.clientId);

    const updated = await prisma.checkIn.update({
      where: { id },
      data: {
        date: date ? parseDate(date) : checkin.date,
        weightKg: weightKg === undefined ? checkin.weightKg : weightKg,
        waistCm: waistCm === undefined ? checkin.waistCm : waistCm,
        notes: notes === undefined ? checkin.notes : notes
      }
    });

    res.json(updated);
  })
);

router.delete(
  "/checkins/:id",
  validate({ params: checkinIdParams }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { id } = req.validated?.params as z.infer<typeof checkinIdParams>;

    const checkin = await prisma.checkIn.findUnique({
      where: { id }
    });

    if (!checkin) {
      throw new AppError(404, "NOT_FOUND", "Check-in not found");
    }

    await assertClientAccess(user, checkin.clientId);

    await prisma.checkIn.delete({
      where: { id }
    });

    res.json({ ok: true });
  })
);

export default router;

function isPrismaKnownRequestError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}
