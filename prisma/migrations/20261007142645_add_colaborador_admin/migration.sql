/*
  Warnings:

  - Added the required column `colaboradorId` to the `AvaliacaoAtendimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AvaliacaoAtendimento" ADD COLUMN     "colaboradorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Administrador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_email_key" ON "Administrador"("email");

-- CreateIndex
CREATE INDEX "AvaliacaoAtendimento_colaboradorId_idx" ON "AvaliacaoAtendimento"("colaboradorId");

-- CreateIndex
CREATE INDEX "AvaliacaoAtendimento_createdAt_idx" ON "AvaliacaoAtendimento"("createdAt");

-- AddForeignKey
ALTER TABLE "AvaliacaoAtendimento" ADD CONSTRAINT "AvaliacaoAtendimento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
