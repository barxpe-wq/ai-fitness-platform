import { Role } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../middleware/error";

export async function assertClientAccess(user: {
  id: string;
  role: Role;
}, clientId: string) {
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { id: clientId }
  });

  if (!clientProfile) {
    throw new AppError(404, "NOT_FOUND", "Client not found");
  }

  if (user.role === Role.TRAINER && clientProfile.trainerId !== user.id) {
    throw new AppError(404, "NOT_FOUND", "Client not found");
  }

  return clientProfile;
}
