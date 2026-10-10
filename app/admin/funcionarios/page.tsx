import { redirect } from "next/navigation";
import Image from "next/image";
import { UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { getFuncionarios } from "../../_actions/get-funcionarios";
import { getSession } from "../../_lib/auth";
import { DashboardSidebar } from "../dashboard/dashboard-sidebar";
import { FuncionarioFormDialog } from "./funcionario-form-dialog";

export default async function FuncionariosPage() {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  const funcionarios = await getFuncionarios();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="min-h-screen lg:pl-72">
        <header className="flex min-h-20 items-center justify-between border-b border-border px-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-4">
            <DashboardSidebar administratorName={administrator.nome} />
            <h1 className="text-lg font-semibold">Funcionários</h1>
          </div>
          <FuncionarioFormDialog />
        </header>
        <section className="mx-auto w-full max-w-7xl p-4 sm:p-8 lg:p-10">
          {funcionarios.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {funcionarios.map((funcionario) => (
                <Card key={funcionario.id} className="gap-0 p-0">
                  <div className="relative aspect-square w-full bg-muted">
                    {funcionario.fotoUrl ? (
                      <Image
                        src={funcionario.fotoUrl}
                        alt={`Foto de ${funcionario.nome}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <UserRound aria-hidden="true" className="size-16" />
                      </div>
                    )}
                  </div>
                  <CardContent className="px-4 py-4 text-center">
                    <CardTitle>{funcionario.nome}</CardTitle>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
                  Nenhum funcionário cadastrado.
                </p>
          )}
        </section>
      </div>
    </main>
  );
}
