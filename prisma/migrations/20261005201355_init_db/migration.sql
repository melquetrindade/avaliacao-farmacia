-- CreateTable
CREATE TABLE "AvaliacaoAtendimento" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendimentoNota" INTEGER NOT NULL,
    "nps" INTEGER NOT NULL,
    "melhoria" TEXT[],

    CONSTRAINT "AvaliacaoAtendimento_pkey" PRIMARY KEY ("id")
);
