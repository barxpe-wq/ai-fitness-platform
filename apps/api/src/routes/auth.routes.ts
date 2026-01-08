import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { AppError, asyncHandler } from "../middleware/error";
import { validate } from "../middleware/validate";
import { verifyPassword } from "../utils/password";
import { signAccessToken } from "../utils/jwt";
import { verifyJWT } from "../middleware/auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validated?.body as z.infer<
      typeof loginSchema
    >;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid credentials");
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid credentials");
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  })
);

router.get(
  "/me",
  verifyJWT,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Missing user context");
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });
  })
);

export default router;
