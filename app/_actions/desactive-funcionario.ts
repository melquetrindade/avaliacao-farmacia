"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../_lib/auth";
import { db } from "../_lib/prisma";

export type SetFuncionarioAtivoState = {
  error: string | null;
  success: boolean;
};

export async function setFuncionarioAtivo(
  _previousState: SetFuncionarioAtivoState,
  formData: FormData,
): Promise<SetFuncionarioAtivoState> {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  const id = formData.get("id");
  const ativoValue = formData.get("ativo");

  if (typeof id !== "string" || !id) {
    return { error: "Funcionário inválido.", success: false };
  }

  if (ativoValue !== "true" && ativoValue !== "false") {
    return { error: "Status inválido.", success: false };
  }

  try {
    await db.colaborador.update({
      where: { id },
      data: { ativo: ativoValue === "true" },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return { error: "Funcionário não encontrado.", success: false };
    }

    console.error("Falha ao atualizar o status do funcionário:", error);
    return {
      error: "Não foi possível atualizar o status do funcionário.",
      success: false,
    };
  }

  revalidatePath("/admin/funcionarios");
  return { error: null, success: true };
}