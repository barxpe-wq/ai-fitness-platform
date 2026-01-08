import jwt from "jsonwebtoken";
import { config } from "../config";
import type { Role } from "../types/role";

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
