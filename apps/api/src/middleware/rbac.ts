import type { RequestHandler } from "express";
import { Role } from "@prisma/client";
import { AppError } from "./error";

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    const user = req.user;
    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Missing user context");
    }

    if (!roles.includes(user.role)) {
      throw new AppError(403, "FORBIDDEN", "Insufficient role");
    }

    next();
  };
}
