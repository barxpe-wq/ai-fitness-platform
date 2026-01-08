import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { Role, Prisma } from "@prisma/client";
import { AppError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { verifyJWT } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { hashPassword } from "../utils/password";

const router = Router();

router.use(verifyJWT, requireRole(Role.TRAINER, Role.ADMIN));

const clientIdParams = z.object({
  id: z.string().cuid()
});

const createClientSchema = z.object({
  email: z.string().email(),
  tempPassword: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  trainerId: z.string().cuid().optional()
});

const updateClientSchema = z
  .object({
    email: z.string().email().optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required"
  });

function formatClient(profile: {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  user: { email: string };
}) {
  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.user.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    createdAt: profile.createdAt
  };
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const user = req.user!;

    const profiles = await prisma.clientProfile.findMany({
      where: user.role === Role.TRAINER ? { trainerId: user.id } : undefined,
      include: {
        user: { select: { email: true } }
      }
    });

    res.json(profiles.map(formatClient));
  })
);

router.post(
  "/",
  validate({ body: createClientSchema }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { email, tempPassword, firstName, lastName, trainerId } =
      req.validated?.body as z.infer<typeof createClientSchema>;

    if (user.role === Role.ADMIN && !trainerId) {
      throw new AppError(400, "VALIDATION_ERROR", "trainerId is required");
    }

    if (user.role === Role.TRAINER && trainerId) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "trainerId is not allowed for trainers"
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError(409, "CONFLICT", "Email already in use");
    }

    const resolvedTrainerId =
      user.role === Role.TRAINER ? user.id : (trainerId as string);

    const trainer = await prisma.user.findUnique({
      where: { id: resolvedTrainerId }
    });

    if (!trainer) {
      throw new AppError(404, "NOT_FOUND", "Trainer not found");
    }

    const passwordHash = await hashPassword(tempPassword);

    const client = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const createdUser = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: Role.CLIENT
          }
        });

        const profile = await tx.clientProfile.create({
          data: {
            userId: createdUser.id,
            trainerId: resolvedTrainerId,
            firstName,
            lastName
          },
          include: {
            user: { select: { email: true } }
          }
        });

        return profile;
      }
    );

    res.status(201).json(formatClient(client));
  })
);

router.get(
  "/:id",
  validate({ params: clientIdParams }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { id } = req.validated?.params as z.infer<typeof clientIdParams>;

    const profile =
      user.role === Role.TRAINER
        ? await prisma.clientProfile.findFirst({
            where: { id, trainerId: user.id },
            include: { user: { select: { email: true } } }
          })
        : await prisma.clientProfile.findUnique({
            where: { id },
            include: { user: { select: { email: true } } }
          });

    if (!profile) {
      throw new AppError(404, "NOT_FOUND", "Client not found");
    }

    res.json(formatClient(profile));
  })
);

router.patch(
  "/:id",
  validate({ params: clientIdParams, body: updateClientSchema }),
  asyncHandler(async (req, res) => {
    const user = req.user!;
    const { id } = req.validated?.params as z.infer<typeof clientIdParams>;
    const { email, firstName, lastName } =
      req.validated?.body as z.infer<typeof updateClientSchema>;

    if (user.role === Role.TRAINER && email) {
      throw new AppError(400, "VALIDATION_ERROR", "Email update not allowed");
    }

    const profile =
      user.role === Role.TRAINER
        ? await prisma.clientProfile.findFirst({
            where: { id, trainerId: user.id },
            include: { user: true }
          })
        : await prisma.clientProfile.findUnique({
            where: { id },
            include: { user: true }
          });

    if (!profile) {
      throw new AppError(404, "NOT_FOUND", "Client not found");
    }

    if (user.role === Role.ADMIN && email && email !== profile.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new AppError(409, "CONFLICT", "Email already in use");
      }
    }

    const updated = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        if (user.role === Role.ADMIN && email && email !== profile.user.email) {
          await tx.user.update({
            where: { id: profile.userId },
            data: { email }
          });
        }

        const updatedProfile = await tx.clientProfile.update({
          where: { id: profile.id },
          data: {
            firstName: firstName ?? profile.firstName,
            lastName: lastName ?? profile.lastName
          },
          include: { user: { select: { email: true } } }
        });

        return updatedProfile;
      }
    );

    res.json(formatClient(updated));
  })
);

export default router;
