import { getSession } from "../../_lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { DashboardSidebar } from "./dashboard-sidebar";
import {
  dashboardMinimums,
  getDashboardData,
} from "./dashboard-data";
import { DashboardCharts } from "./dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const dashboardTimeZone = "America/Sao_Paulo";

function getCurrentMonth() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: dashboardTimeZone,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function getMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
}

function getPreviousMonth(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return monthNumber === 1
    ? `${year - 1}-12`
    : `${year}-${String(monthNumber - 1).padStart(2, "0")}`;
}

function formatChange(current: number, previous: number, suffix = "") {
  const difference = current - previous;
  if (difference === 0) return `Sem alteração em relação ao período anterior${suffix}.`;
  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(Math.abs(difference));
  return `${difference > 0 ? "+" : "-"}${formatted}${suffix} em relação ao período anterior.`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; minimo?: string }>;
}) {
  const administrator = await getSession();

  if (!administrator) {
    redirect("/admin");
  }

  const params = await searchParams;
  const currentMonth = getCurrentMonth();
  const requestedMonth = params.mes ?? currentMonth;
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth) &&
    requestedMonth <= currentMonth
    ? requestedMonth
    : currentMonth;
  const minimum = Number(params.minimo);
  const minimumResponses = dashboardMinimums.includes(
    minimum as (typeof dashboardMinimums)[number],
  )
    ? minimum
    : 5;
  const data = await getDashboardData(month, minimumResponses);
  const { summary, previousSummary } = data;
  const excellentPercent =
    summary.total === 0
      ? 0
      : Math.round((summary.excellent / summary.total) * 100);
  const negativePercent =
    summary.total === 0
      ? 0
      : Math.round((summary.negative / summary.total) * 100);
  const previousExcellentPercent =
    previousSummary && previousSummary.total > 0
      ? Math.round((previousSummary.excellent / previousSummary.total) * 100)
      : 0;
  const previousNegativePercent =
    previousSummary && previousSummary.total > 0
      ? Math.round((previousSummary.negative / previousSummary.total) * 100)
      : 0;

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
              src="/logo01.png"
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
          <div>
            <p className="text-sm font-medium text-primary">Visão geral</p>
            <h2
              id="dashboard-title"
              className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Indicadores da pesquisa de avaliação
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Acompanhe a experiência dos clientes e identifique oportunidades
              de melhoria.
            </p>
          </div>

          <form
            method="get"
            className="mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
          >
            <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
              Mês de análise
              <input
                type="month"
                name="mes"
                defaultValue={month}
                max={currentMonth}
                required
                className="h-10 rounded-lg border border-input bg-background px-3"
              />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
              Mínimo de avaliações por funcionário
              <select
                name="minimo"
                defaultValue={String(minimumResponses)}
                className="h-10 rounded-lg border border-input bg-background px-3"
              >
                {dashboardMinimums.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Aplicar filtros
            </button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Mês exibido: {getMonthLabel(month)}
            {previousSummary
              ? ` · Comparação com ${getMonthLabel(getPreviousMonth(month))}${month === currentMonth ? " até o mesmo dia do mês." : "."}`
              : "."}
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total de avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.total}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {previousSummary
                    ? formatChange(summary.total, previousSummary.total)
                    : "Respostas recebidas no mês selecionado."}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Atendimentos excelentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{excellentPercent}%</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {summary.excellent} de {summary.total} avaliações
                  {previousSummary
                    ? ` · ${formatChange(excellentPercent, previousExcellentPercent, " p.p.")}`
                    : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>NPS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {summary.total === 0 ? "—" : summary.nps}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {summary.promoters} promotores (
                  {summary.total === 0
                    ? 0
                    : Math.round((summary.promoters / summary.total) * 100)}
                  %) · {summary.passives} neutros (
                  {summary.total === 0
                    ? 0
                    : Math.round((summary.passives / summary.total) * 100)}
                  %) · {summary.detractors} detratores (
                  {summary.total === 0
                    ? 0
                    : Math.round((summary.detractors / summary.total) * 100)}
                  %)
                  {previousSummary
                    ? ` · ${formatChange(summary.nps, previousSummary.nps, " pontos")}`
                    : ""}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Avaliações críticas (NPS 0–4)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {summary.negative} ({negativePercent}%)
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {previousSummary
                    ? `${formatChange(negativePercent, previousNegativePercent, " p.p.")} ${summary.negative > previousSummary.negative ? "Acompanhe os motivos relatados." : ""}`
                    : "Clientes que também podem selecionar pontos de melhoria."}
                </p>
              </CardContent>
            </Card>
          </div>

          {summary.total === 0 && (
            <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              Não há avaliações para o período selecionado. Tente ampliar o
              intervalo para visualizar os indicadores.
            </p>
          )}

          <DashboardCharts
            summary={summary}
            trend={data.trend}
            improvements={data.improvements}
            employees={data.employees}
          />
        </section>
      </div>
    </main>
  );
}