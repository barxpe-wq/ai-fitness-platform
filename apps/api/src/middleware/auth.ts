import type { RequestHandler } from "express";
import { AppError } from "./error";
import { verifyAccessToken } from "../utils/jwt";

export const verifyJWT: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHORIZED", "Missing authorization token");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
    next();
  } catch {
    throw new AppError(401, "UNAUTHORIZED", "Invalid authorization token");
  }
};
