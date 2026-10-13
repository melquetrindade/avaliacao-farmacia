"use server";

import "server-only";

import { db } from "../_lib/prisma";

const OPCOES_MELHORIA = [
  "Atendimento",
  "Espera",
  "Preço",
  "Não encontrei o produto que procurava",
  "Organização",
  "Pagamento",
  "Outro",
];

export type CreateAvaliacaoState = {
  error: string | null;
  success: boolean;
};

export async function createAvaliacao(
  _previousState: CreateAvaliacaoState,
  formData: FormData,
): Promise<CreateAvaliacaoState> {
  const colaboradorId = formData.get("colaboradorId");
  const atendimentoValue = formData.get("atendimentoNota");
  const npsValue = formData.get("nps");
  const melhorias = formData.getAll("melhoria");

  if (typeof colaboradorId !== "string" || !colaboradorId) {
    return { error: "Selecione o funcionário que atendeu você.", success: false };
  }

  const atendimentoNota =
    typeof atendimentoValue === "string" ? Number(atendimentoValue) : NaN;
  const nps = typeof npsValue === "string" ? Number(npsValue) : NaN;

  if (
    !Number.isInteger(atendimentoNota) ||
    atendimentoNota < 1 ||
    atendimentoNota > 3
  ) {
    return { error: "Selecione uma avaliação para o atendimento.", success: false };
  }

  if (!Number.isInteger(nps) || nps < 0 || nps > 10) {
    return {
      error: "Selecione uma nota de recomendação entre 0 e 10.",
      success: false,
    };
  }

  if (
    melhorias.some(
      (melhoria) =>
        typeof melhoria !== "string" ||
        !OPCOES_MELHORIA.includes(melhoria),
    )
  ) {
    return { error: "Uma das opções de melhoria é inválida.", success: false };
  }

  const melhoria = [...new Set(melhorias as string[])];

  if (nps <= 4 && melhoria.length === 0) {
    return {
      error: "Selecione ao menos um ponto que podemos melhorar.",
      success: false,
    };
  }

  if (nps > 4 && melhoria.length > 0) {
    return {
      error: "As opções de melhoria só devem ser enviadas para notas de 0 a 4.",
      success: false,
    };
  }

  const colaborador = await db.colaborador.findFirst({
    where: { id: colaboradorId, ativo: true },
    select: { id: true },
  });

  if (!colaborador) {
    return {
      error: "Este funcionário não está mais disponível. Inicie uma nova avaliação.",
      success: false,
    };
  }

  try {
    await db.avaliacaoAtendimento.create({
      data: {
        colaboradorId,
        atendimentoNota,
        nps,
        melhoria,
      },
    });
  } catch (error) {
    console.error("Falha ao salvar a avaliação do atendimento:", error);
    return {
      error: "Não foi possível salvar sua avaliação. Tente novamente.",
      success: false,
    };
  }

  return { error: null, success: true };
}
