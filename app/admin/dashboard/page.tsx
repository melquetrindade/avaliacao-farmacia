import { getSession } from "../../_lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { DashboardSidebar } from "./dashboard-sidebar";

export default async function DashboardPage() {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen lg:pl-72">
        <header className="flex min-h-20 items-center justify-start gap-4 border-b border-border px-4 sm:px-8 lg:px-10">
          <div>
            <DashboardSidebar administratorName={administrator.nome} />
          </div>
          <div className="hidden lg:block" />
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/logo.jfif"
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-xl object-contain"
            />
            <span className="text-sm font-semibold leading-tight text-foreground sm:text-base">
              Drogaria nossa senhora de fátima
            </span>
          </div>
        </header>

        <section
          aria-labelledby="dashboard-title"
          className="mx-auto w-full max-w-7xl p-4 sm:p-8 lg:p-10"
        >
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-8">
            <p className="text-sm font-medium text-primary">
              Visão geral
            </p>
            <h2
              id="dashboard-title"
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Bem-vindo ao painel, {administrator.nome}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Acesse pelo menu lateral as ferramentas administrativas da
              avaliação da farmácia.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}