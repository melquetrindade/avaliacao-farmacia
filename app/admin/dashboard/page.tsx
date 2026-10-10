import { getSession } from "../../_lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";

export default async function DashboardPage() {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-[#090b10] text-white">
      <div className="min-h-screen lg:pl-72">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-8 lg:px-10">
          <div>
            <DashboardSidebar administratorName={administrator.nome} />
          </div>
          <div className="hidden lg:block" />
          <div className="ml-auto text-right">
            <h1 className="text-base font-semibold sm:text-lg">
              Olá, bem-vindo!
            </h1>
            <p className="mt-1 text-xs text-white/60 sm:text-sm">
              {new Intl.DateTimeFormat("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
          </div>
        </header>

        <section
          aria-labelledby="dashboard-title"
          className="mx-auto w-full max-w-7xl p-4 sm:p-8 lg:p-10"
        >
          <div className="rounded-2xl border border-white/10 bg-[#11141c] p-5 sm:p-8">
            <p className="text-sm font-medium text-violet-300">
              Visão geral
            </p>
            <h2
              id="dashboard-title"
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Bem-vindo ao painel, {administrator.nome}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
              Acesse pelo menu lateral as ferramentas administrativas da
              avaliação da farmácia.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}