"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  const [state, formAction, pending] = useActionState(
    setFuncionarioAtivo,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

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
