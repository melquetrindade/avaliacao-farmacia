import Image from "next/image";
import { db } from "./_lib/prisma";
import { PesquisaAtendimento } from "./pesquisa-atendimento";

export default async function Home() {
  const funcionarios = await db.colaborador.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: {
      id: true,
      nome: true,
      fotoUrl: true,
    },
  });

  if (funcionarios.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <Image
            src="/logo01.png"
            alt="Drogaria Nossa Senhora de Fátima"
            width={72}
            height={72}
            className="mx-auto size-18 rounded-2xl object-contain"
            priority
          />
          <h1 className="mt-6 text-2xl font-semibold">
            Avaliação de atendimento
          </h1>
          <p className="mt-3 text-muted-foreground">
            No momento, não há funcionários disponíveis para iniciar a
            avaliação. Procure um atendente da farmácia.
          </p>
        </section>
      </main>
    );
  }

  return <PesquisaAtendimento funcionarios={funcionarios} />;
}
