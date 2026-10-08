import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to initialize PrismaClient");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is required to seed the administrator");
  }

  const senhaHash = await argon2.hash(adminPassword);

  await prisma.administrador.upsert({
    where: {
      email: "melquetrindade654@gmail.com",
    },
    update: {},
    create: {
      nome: "Melque Rodrigues",
      email: "melquetrindade654@gmail.com",
      senhaHash,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });