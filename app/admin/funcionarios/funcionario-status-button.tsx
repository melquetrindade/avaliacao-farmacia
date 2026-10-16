"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useFuncionariosFeedback } from "./feedback-provider";
import {
  setFuncionarioAtivo,
  type SetFuncionarioAtivoState,
} from "../../_actions/desactive-funcionario";

const initialState: SetFuncionarioAtivoState = {
  error: null,
  success: false,
};

export function FuncionarioStatusButton({
  funcionarioId,
  ativo,
}: {
  funcionarioId: string;
  ativo: boolean;
}) {
  const router = useRouter();
  const showFeedback = useFuncionariosFeedback();
  const [state, formAction, pending] = useActionState(
    async (previousState: SetFuncionarioAtivoState, formData: FormData) => {
      const result = await setFuncionarioAtivo(previousState, formData);

      if (result.success) {
        showFeedback(
          ativo
            ? "Funcionário desativado com sucesso."
            : "Funcionário ativado com sucesso.",
          "success",
        );
        router.refresh();
      } else if (result.error) {
        showFeedback(result.error, "error");
      }

      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col items-center gap-1">
      <input type="hidden" name="id" value={funcionarioId} />
      <input type="hidden" name="ativo" value={String(!ativo)} />
      <Button
        type="submit"
        variant={ativo ? "secondary" : "outline"}
        disabled={pending}
      >
        {pending ? "Atualizando..." : ativo ? "Desativar" : "Ativar"}
      </Button>
      {state.error && (
        <p role="alert" className="max-w-40 text-center text-xs text-destructive">
          {state.error}
        </p>
      )}
    </form>
  );
}
