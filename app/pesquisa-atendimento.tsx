"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { ArrowLeft, Check, Star, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  createAvaliacao,
  type CreateAvaliacaoState,
} from "./_actions/create-avaliacao";

type Funcionario = {
  id: string;
  nome: string;
  fotoUrl: string | null;
};

type Etapa = "funcionario" | "atendimento" | "nps" | "melhoria";

const initialState: CreateAvaliacaoState = {
  error: null,
  success: false,
};

const opcoesMelhoria = [
  "Atendimento",
  "Espera",
  "Preço",
  "Não encontrei o produto que procurava",
  "Organização",
  "Pagamento",
  "Outro",
];

export function PesquisaAtendimento({
  funcionarios,
}: {
  funcionarios: Funcionario[];
}) {
  const [ciclo, setCiclo] = useState(0);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  return (
    <PesquisaCiclo
      key={ciclo}
      funcionarios={funcionarios}
      mostrarConfirmacao={mostrarConfirmacao}
      onSelecionarFuncionario={() => setMostrarConfirmacao(false)}
      onSucesso={() => {
        setCiclo((atual) => atual + 1);
        setMostrarConfirmacao(true);
      }}
    />
  );
}

function PesquisaCiclo({
  funcionarios,
  mostrarConfirmacao,
  onSelecionarFuncionario,
  onSucesso,
}: {
  funcionarios: Funcionario[];
  mostrarConfirmacao: boolean;
  onSelecionarFuncionario: () => void;
  onSucesso: () => void;
}) {
  const [etapa, setEtapa] = useState<Etapa>("funcionario");
  const [colaboradorId, setColaboradorId] = useState("");
  const [atendimentoNota, setAtendimentoNota] = useState<number | null>(null);
  const [nps, setNps] = useState<number | null>(null);
  const [melhorias, setMelhorias] = useState<string[]>([]);
  const [state, formAction, pending] = useActionState(
    async (previousState: CreateAvaliacaoState, formData: FormData) => {
      const result = await createAvaliacao(previousState, formData);

      if (result.success) {
        onSucesso();
      }

      return result;
    },
    initialState,
  );

  function voltar() {
    if (etapa === "atendimento") {
      setEtapa("funcionario");
    } else if (etapa === "nps") {
      setEtapa("atendimento");
    } else if (etapa === "melhoria") {
      setEtapa("nps");
    }
  }

  function alternarMelhoria(opcao: string) {
    setMelhorias((selecionadas) =>
      selecionadas.includes(opcao)
        ? selecionadas.filter((item) => item !== opcao)
        : [...selecionadas, opcao],
    );
  }

  const etapaNumero =
    etapa === "atendimento" ? 1 : etapa === "nps" ? 2 : etapa === "melhoria" ? 3 : 0;
  const funcionarioSelecionado = funcionarios.find(
    (funcionario) => funcionario.id === colaboradorId,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="w-full max-w-2xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.jfif"
            alt="Drogaria Nossa Senhora de Fátima"
            width={64}
            height={64}
            className="size-16 rounded-2xl object-contain"
            priority
          />
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            Drogaria Nossa Senhora de Fátima
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Avaliação de atendimento
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            Sua opinião é importante para melhorarmos cada vez mais.
          </p>
        </header>

        {mostrarConfirmacao && etapa === "funcionario" && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          >
            Obrigado! Sua avaliação foi registrada. Você já pode iniciar uma
            nova avaliação.
          </p>
        )}

        <Card className="overflow-hidden rounded-3xl border-border shadow-lg shadow-primary/5">
          <CardContent className="p-5 sm:p-8">
            {etapa === "funcionario" ? (
              <>
                <div className="mb-6">
                  <p className="text-sm font-medium text-primary">Pergunta 00</p>
                  <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                    Quem atendeu você?
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selecione o funcionário que realizou seu atendimento.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {funcionarios.map((funcionario) => (
                    <button
                      key={funcionario.id}
                      type="button"
                      onClick={() => {
                        setColaboradorId(funcionario.id);
                        onSelecionarFuncionario();
                        setEtapa("atendimento");
                      }}
                      className="group flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 text-center transition hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {funcionario.fotoUrl ? (
                        <Image
                          src={funcionario.fotoUrl}
                          alt=""
                          width={88}
                          height={88}
                          unoptimized
                          className="size-22 rounded-full object-cover ring-2 ring-border transition group-hover:ring-primary"
                        />
                      ) : (
                        <span className="flex size-22 items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-border">
                          <UserRound aria-hidden="true" className="size-10" />
                        </span>
                      )}
                      <span className="text-sm font-semibold">
                        {funcionario.nome}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Pergunta 0{etapaNumero}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                      {etapa === "atendimento"
                        ? "Como você avalia o atendimento de hoje?"
                        : etapa === "nps"
                          ? "De 0 a 10, quanto você recomendaria nossa farmácia?"
                          : "O que podemos melhorar?"}
                    </h2>
                    {etapa === "atendimento" && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Funcionário: {funcionarioSelecionado?.nome}
                      </p>
                    )}
                    {etapa === "melhoria" && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Você pode selecionar mais de uma opção.
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {etapaNumero} de {nps !== null && nps > 4 ? "2" : "3"}
                  </span>
                </div>

                <form action={formAction}>
                  <input
                    type="hidden"
                    name="colaboradorId"
                    value={colaboradorId}
                  />
                  {atendimentoNota !== null && (
                    <input
                      type="hidden"
                      name="atendimentoNota"
                      value={atendimentoNota}
                    />
                  )}
                  {nps !== null && (
                    <input type="hidden" name="nps" value={nps} />
                  )}
                  {etapa === "melhoria" &&
                    melhorias.map((melhoria) => (
                      <input
                        key={melhoria}
                        type="hidden"
                        name="melhoria"
                        value={melhoria}
                      />
                    ))}

                  {etapa === "atendimento" && (
                    <>
                      <div className="grid gap-3">
                        {[
                          { nota: 1, rotulo: "Ruim" },
                          { nota: 2, rotulo: "Regular" },
                          { nota: 3, rotulo: "Excelente" },
                        ].map(({ nota, rotulo }) => (
                          <button
                            key={nota}
                            type="button"
                            aria-pressed={atendimentoNota === nota}
                            onClick={() => setAtendimentoNota(nota)}
                            className={`flex min-h-14 items-center justify-between rounded-xl border px-4 text-left font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              atendimentoNota === nota
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border bg-card hover:border-primary/50"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                                {nota}
                              </span>
                              {rotulo}
                            </span>
                            {nota === 3 && (
                              <Star
                                aria-hidden="true"
                                className="size-5 text-amber-500"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="mt-8 flex justify-between gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={voltar}
                        >
                          <ArrowLeft aria-hidden="true" />
                          Voltar
                        </Button>
                        <Button
                          type="button"
                          disabled={atendimentoNota === null}
                          onClick={() => setEtapa("nps")}
                        >
                          Próxima pergunta
                        </Button>
                      </div>
                    </>
                  )}

                  {etapa === "nps" && (
                    <>
                      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                        {Array.from({ length: 11 }, (_, nota) => (
                          <button
                            key={nota}
                            type="button"
                            aria-pressed={nps === nota}
                            onClick={() => setNps(nota)}
                            className={`flex aspect-square min-h-10 items-center justify-center rounded-xl border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              nps === nota
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card hover:border-primary hover:bg-primary/5"
                            }`}
                          >
                            {nota}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                        <span>Pouco provável</span>
                        <span>Muito provável</span>
                      </div>
                      <div className="mt-8 flex justify-between gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={voltar}
                        >
                          <ArrowLeft aria-hidden="true" />
                          Voltar
                        </Button>
                        {nps !== null && nps <= 4 ? (
                          <Button
                            type="button"
                            disabled={nps === null}
                            onClick={() => setEtapa("melhoria")}
                          >
                            Próxima pergunta
                          </Button>
                        ) : (
                          <Button type="submit" disabled={nps === null || pending}>
                            {pending ? "Enviando..." : "Finalizar"}
                          </Button>
                        )}
                      </div>
                    </>
                  )}

                  {etapa === "melhoria" && (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {opcoesMelhoria.map((opcao) => {
                          const selecionada = melhorias.includes(opcao);

                          return (
                            <button
                              key={opcao}
                              type="button"
                              aria-pressed={selecionada}
                              onClick={() => alternarMelhoria(opcao)}
                              className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                selecionada
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border bg-card hover:border-primary/50"
                              }`}
                            >
                              <span
                                className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                                  selecionada
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-input"
                                }`}
                              >
                                {selecionada && (
                                  <Check
                                    aria-hidden="true"
                                    className="size-3.5"
                                  />
                                )}
                              </span>
                              {opcao}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-8 flex justify-between gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={voltar}
                        >
                          <ArrowLeft aria-hidden="true" />
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={melhorias.length === 0 || pending}
                        >
                          {pending ? "Enviando..." : "Finalizar"}
                        </Button>
                      </div>
                    </>
                  )}

                  {state.error && (
                    <p
                      role="alert"
                      className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
                    >
                      {state.error}
                    </p>
                  )}
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <footer className="mt-6 text-center text-xs text-muted-foreground">
          Obrigado por escolher nossa farmácia.
        </footer>
      </div>
    </main>
  );
}
