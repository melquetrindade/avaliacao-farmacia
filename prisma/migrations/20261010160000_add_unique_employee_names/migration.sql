ALTER TABLE "Colaborador"
ADD COLUMN "nomeNormalizado" TEXT;

UPDATE "Colaborador"
SET "nomeNormalizado" = lower(btrim("nome"));

CREATE UNIQUE INDEX "Colaborador_nomeNormalizado_key"
ON "Colaborador"("nomeNormalizado");

ALTER TABLE "Colaborador"
ALTER COLUMN "nomeNormalizado" SET NOT NULL;
