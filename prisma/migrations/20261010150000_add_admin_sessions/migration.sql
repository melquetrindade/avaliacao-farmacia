CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "administradorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Sessao_tokenHash_key" ON "Sessao"("tokenHash");
CREATE INDEX "Sessao_administradorId_idx" ON "Sessao"("administradorId");
CREATE INDEX "Sessao_expiresAt_idx" ON "Sessao"("expiresAt");

ALTER TABLE "Sessao"
ADD CONSTRAINT "Sessao_administradorId_fkey"
FOREIGN KEY ("administradorId") REFERENCES "Administrador"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
