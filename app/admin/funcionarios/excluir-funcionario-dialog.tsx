"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFuncionariosFeedback } from "./feedback-provider";
import {
  deleteFuncionario,
  type DeleteFuncionarioState,
} from "../../_actions/delete-funcionario";

const initialState: DeleteFuncionarioState = {
  error: null,
  success: false,
  warning: null,
};

export function ExcluirFuncionarioDialog({
  funcionarioId,
  funcionarioNome,
}: {
  funcionarioId: string;
  funcionarioNome: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button type="button" variant="destructive">
            Excluir
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-6 text-foreground shadow-xl outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {open && (
            <ExcluirFuncionarioForm
              funcionarioId={funcionarioId}
              funcionarioNome={funcionarioNome}
              onSuccess={() => setOpen(false)}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ExcluirFuncionarioForm({
  funcionarioId,
  funcionarioNome,
  onSuccess,
}: {
  funcionarioId: string;
  funcionarioNome: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const showFeedback = useFuncionariosFeedback();
  const [state, formAction, pending] = useActionState(
    async (previousState: DeleteFuncionarioState, formData: FormData) => {
      const result = await deleteFuncionario(previousState, formData);

      if (result.success) {
        showFeedback(
          "Funcionário excluído.",
          result.warning ? "warning" : "success",
          result.warning ?? undefined,
        );
        router.refresh();

        if (!result.warning) {
          onSuccess();
        }
      } else if (result.error) {
        showFeedback(result.error, "error");
      }

      return result;
    },
    initialState,
  );

  if (state.warning) {
    return (
      <>
        <Dialog.Title className="text-xl font-semibold">
          Funcionário excluído
        </Dialog.Title>
        <p role="alert" className="mt-3 text-sm text-destructive">
          {state.warning}
        </p>
        <div className="mt-6 flex justify-end">
          <Dialog.Close
            render={
              <Button type="button" variant="outline">
                Fechar
              </Button>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Dialog.Title className="text-xl font-semibold">
        Excluir funcionário
      </Dialog.Title>
      <Dialog.Description className="mt-2 text-sm text-muted-foreground">
        Tem certeza que deseja excluir {funcionarioNome}? Esta ação não pode ser
        desfeita.
      </Dialog.Description>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="id" value={funcionarioId} />

        {state.error && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Dialog.Close
            render={
              <Button type="button" variant="outline" disabled={pending}>
                Cancelar
              </Button>
            }
          />
          <Button
            type="submit"
            variant="destructive"
            disabled={pending || state.success}
          >
            {pending ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </div>
      </form>
    </>
  );
}
