"use client";

import { useActionState } from "react";
import { login } from "../_actions/login";
import { Alert } from "../_components/ui/alert";
import { Button } from "../_components/ui/button";

const initialState = { error: null };

export default function Home() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg shadow-primary/10">
        <div
          aria-hidden="true"
          className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-accent"
        />
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Acesso administrativo
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com seu email e senha para continuar.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="voce@exemplo.com"
              required
              disabled={pending}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
              disabled={pending}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {state.error && <Alert>{state.error}</Alert>}

          <Button
            type="submit"
            disabled={pending}
            className="h-10 w-full rounded-lg px-4"
          >
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </section>
    </main>
  );
}
