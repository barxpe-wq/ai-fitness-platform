export const ROLES = {
  ADMIN: "ADMIN",
  TRAINER: "TRAINER",
  CLIENT: "CLIENT"
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
