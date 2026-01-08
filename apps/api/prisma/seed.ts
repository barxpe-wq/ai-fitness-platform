import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const trainerEmail = "trainer@demo.com";
  const trainerPassword = "Demo1234!";
  const passwordHash = await bcrypt.hash(trainerPassword, 10);

  const trainerRole: Prisma.UserCreateInput["role"] = "TRAINER";
  const clientRole: Prisma.UserCreateInput["role"] = "CLIENT";

  const existingTrainer = await prisma.user.findUnique({
    where: { email: trainerEmail }
  });

  const trainer =
    existingTrainer ??
    (await prisma.user.create({
      data: {
        email: trainerEmail,
        passwordHash,
        role: trainerRole
      }
    }));

  const clients = [
    { email: "client1@demo.com", firstName: "Anna", lastName: "Kowalska" },
    { email: "client2@demo.com", firstName: "Jan", lastName: "Nowak" }
  ];

  for (const client of clients) {
    const existingClient = await prisma.user.findUnique({
      where: { email: client.email }
    });

    if (existingClient) {
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: client.email,
        passwordHash,
        role: clientRole
      }
    });

    await prisma.clientProfile.create({
      data: {
        userId: user.id,
        trainerId: trainer.id,
        firstName: client.firstName,
        lastName: client.lastName
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
