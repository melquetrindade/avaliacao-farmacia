import { redirect } from "next/navigation";
import Image from "next/image";
import { UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFuncionarios } from "../../_actions/get-funcionarios";
import { getSession } from "../../_lib/auth";
import { DashboardSidebar } from "../dashboard/dashboard-sidebar";
import { FuncionariosFeedbackProvider } from "./feedback-provider";
import { FuncionarioFormDialog } from "./funcionario-form-dialog";
import { EditarFuncionarioDialog } from "./editar-funcionario-dialog";
import { ExcluirFuncionarioDialog } from "./excluir-funcionario-dialog";
import { FuncionarioStatusButton } from "./funcionario-status-button";

export default async function FuncionariosPage() {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  const funcionarios = await getFuncionarios();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <FuncionariosFeedbackProvider>
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
                      <Badge
                        variant={funcionario.ativo ? "secondary" : "destructive"}
                        className={
                          funcionario.ativo
                            ? "absolute top-3 left-3 border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "absolute top-3 left-3 border-red-200 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
                        }
                      >
                        <span
                          aria-hidden="true"
                          className={`size-2 rounded-full ${
                            funcionario.ativo ? "bg-emerald-500" : "bg-destructive"
                          }`}
                        />
                        {funcionario.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <CardContent className="px-4 py-4 text-center">
                      <CardTitle>{funcionario.nome}</CardTitle>
                    </CardContent>

                    <div className="flex flex-wrap justify-center gap-2 px-4 pb-4">
                      <EditarFuncionarioDialog funcionario={funcionario} />
                      <ExcluirFuncionarioDialog
                        funcionarioId={funcionario.id}
                        funcionarioNome={funcionario.nome}
                      />
                      <FuncionarioStatusButton
                        key={`${funcionario.id}-${funcionario.ativo}`}
                        funcionarioId={funcionario.id}
                        ativo={funcionario.ativo}
                      />
                    </div>
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
      </FuncionariosFeedbackProvider>
    </main>
  );
}
