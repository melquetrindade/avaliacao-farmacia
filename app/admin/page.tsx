export default function Home() {
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

        <form action="/admin" method="post" className="space-y-5">
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
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
