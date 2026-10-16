"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useFuncionariosFeedback } from "./feedback-provider";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import {
  editarFuncionario,
  type EditFuncionarioState,
} from "../../_actions/edite-funcionario";

type Funcionario = {
  id: string;
  nome: string;
  fotoUrl: string | null;
};

const initialState: EditFuncionarioState = {
  error: null,
  success: false,
};

export function EditarFuncionarioDialog({
  funcionario,
}: {
  funcionario: Funcionario;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={
          <Button
            type="button"
            className="bg-yellow-400 text-yellow-950 hover:bg-yellow-500"
          >
            Editar
          </Button>
        }
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-background p-6 text-foreground shadow-xl outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {open && (
            <EditarFuncionarioForm
              funcionario={funcionario}
              onSuccess={() => setOpen(false)}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditarFuncionarioForm({
  funcionario,
  onSuccess,
}: {
  funcionario: Funcionario;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const showFeedback = useFuncionariosFeedback();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (previousState: EditFuncionarioState, formData: FormData) => {
      const result = await editarFuncionario(previousState, formData);

      if (result.success) {
        showFeedback("Funcionário atualizado com sucesso.", "success");
        router.refresh();
        onSuccess();
      } else if (result.error) {
        showFeedback(result.error, "error");
      }

      return result;
    },
    initialState,
  );

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  function handleImageChange(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
  }

  return (
    <>
      <Dialog.Title className="text-xl font-semibold">
        Editar funcionário
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-muted-foreground">
        Atualize o nome e, se desejar, selecione uma nova imagem.
      </Dialog.Description>

      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <input type="hidden" name="id" value={funcionario.id} />

        <div className="flex flex-col gap-2">
          <label htmlFor={`nome-${funcionario.id}`} className="text-sm font-medium">
            Nome do funcionário
          </label>
          <input
            id={`nome-${funcionario.id}`}
            name="nome"
            type="text"
            maxLength={120}
            required
            disabled={pending}
            defaultValue={funcionario.nome}
            autoComplete="name"
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`foto-${funcionario.id}`} className="text-sm font-medium">
            Imagem do funcionário
          </label>
          <input
            id={`foto-${funcionario.id}`}
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            onChange={(event) =>
              handleImageChange(event.currentTarget.files?.[0] ?? null)
            }
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:font-medium file:text-secondary-foreground"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WebP. Tamanho máximo: 5 MB. Deixe em branco para manter
            a imagem atual.
          </p>
        </div>

        {(previewUrl || funcionario.fotoUrl) && (
          <Card className="w-36 gap-0 overflow-hidden p-0">
            <div className="relative aspect-square w-full bg-muted">
              <Image
                src={previewUrl ?? funcionario.fotoUrl!}
                alt={`Pré-visualização da foto de ${funcionario.nome}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <CardContent className="p-2 text-center">
              <CardTitle className="truncate text-xs">
                {previewUrl ? "Nova imagem" : "Imagem atual"}
              </CardTitle>
            </CardContent>
          </Card>
        )}

        {state.error && (
          <p role="alert" className="text-sm text-destructive">
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
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </>
  );
}
