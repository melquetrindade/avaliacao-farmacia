ALTER TABLE "AvaliacaoAtendimento"
DROP CONSTRAINT "AvaliacaoAtendimento_colaboradorId_fkey";

ALTER TABLE "AvaliacaoAtendimento"
ADD CONSTRAINT "AvaliacaoAtendimento_colaboradorId_fkey"
FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
