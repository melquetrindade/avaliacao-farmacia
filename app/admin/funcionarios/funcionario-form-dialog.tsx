"use client";

import { Dialog } from "@base-ui/react/dialog";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { createFuncionario } from "../../_actions/create-funcionario";
import type { CreateFuncionarioState } from "../../_actions/create-funcionario";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";

const initialState: CreateFuncionarioState = {
  error: null,
  success: false,
};

export function FuncionarioFormDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        render={<Button type="button">Cadastrar</Button>}
      />
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-background p-6 text-foreground shadow-xl outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          {open && <FuncionarioForm onSuccess={() => setOpen(false)} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FuncionarioForm({ onSuccess }: { onSuccess: () => void }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [state, formAction, pending] = useActionState(
    async (previousState: CreateFuncionarioState, formData: FormData) => {
      const result = await createFuncionario(previousState, formData);

      if (result.success) {
        router.refresh();
        onSuccess();
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
    setSelectedImage(file);
    setPreviewUrl(nextPreviewUrl);
  }

  return (
    <>
      <Dialog.Title className="text-xl font-semibold">
        Cadastrar funcionário
      </Dialog.Title>
      <Dialog.Description className="mt-1 text-sm text-muted-foreground">
        Preencha o nome e selecione uma foto para o funcionário.
      </Dialog.Description>

      <form action={formAction} className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome do funcionário
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            maxLength={120}
            required
            disabled={pending}
            autoComplete="name"
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="Digite o nome completo"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="foto" className="text-sm font-medium">
            Imagem do funcionário
          </label>
          <input
            id="foto"
            name="foto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            disabled={pending}
            onChange={(event) =>
              handleImageChange(event.currentTarget.files?.[0] ?? null)
            }
            className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1 file:font-medium file:text-secondary-foreground"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG ou WebP. Tamanho máximo: 5 MB.
          </p>
        </div>

        {previewUrl && selectedImage && (
          <Card className="w-36 gap-0 p-0">
            <div className="relative aspect-square w-full bg-muted">
              <Image
                src={previewUrl}
                alt={`Pré-visualização de ${selectedImage.name}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <CardContent className="p-2 text-center">
              <CardTitle className="truncate text-xs">
                {selectedImage.name}
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
            {pending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </>
  );
}
