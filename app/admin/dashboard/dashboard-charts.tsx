import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CountItem = { label: string; count: number };
type TrendItem = {
  bucket: string;
  label: string;
  total: number;
  excellentPercent: number;
  nps: number;
};
type EmployeeItem = {
  id: string;
  name: string;
  total: number;
  excellent: number;
  regular: number;
  poor: number;
  nps: number;
};

function percent(value: number, total: number) {
  return total === 0 ? 0 : (value / total) * 100;
}

function BarList({
  items,
  total,
  percentageBase = total,
  emptyMessage,
}: {
  items: CountItem[];
  total: number;
  percentageBase?: number;
  emptyMessage: string;
}) {
  if (items.length === 0 || total === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const share = percent(item.count, percentageBase);
        return (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="shrink-0 text-muted-foreground">
                {item.count} ({share.toFixed(1)}%)
              </span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${item.label}: ${item.count} avaliações, ${share.toFixed(1)} por cento`}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${Math.min(100, share)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendChart({
  items,
  metric,
  color,
}: {
  items: TrendItem[];
  metric: "total" | "excellentPercent" | "nps";
  color: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ainda não há avaliações neste período.
      </p>
    );
  }

  const width = 760;
  const height = 250;
  const left = 42;
  const right = 14;
  const top = 16;
  const bottom = 40;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const values = items.map((item) => item[metric]);
  const maxValue =
    metric === "nps"
      ? 100
      : metric === "excellentPercent"
        ? 100
        : Math.max(1, ...values);
  const minValue = metric === "nps" ? -100 : 0;
  const valueRange = maxValue - minValue || 1;
  const x = (index: number) =>
    left +
    (items.length === 1 ? plotWidth / 2 : (index / (items.length - 1)) * plotWidth);
  const y = (value: number) =>
    top + ((maxValue - value) / valueRange) * plotHeight;
  const points = items.map((item, index) => `${x(index)},${y(item[metric])}`);
  const labelStep = Math.max(1, Math.ceil(items.length / 6));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[34rem] w-full"
        role="img"
        aria-label={
          metric === "total"
            ? "Evolução do total de avaliações"
            : metric === "excellentPercent"
              ? "Evolução do percentual de avaliações excelentes"
              : "Evolução do NPS"
        }
      >
        {[0, 1, 2, 3, 4].map((step) => {
          const gridY = top + (plotHeight / 4) * step;
          const value = maxValue - (valueRange / 4) * step;
          return (
            <g key={step}>
              <line
                x1={left}
                x2={width - right}
                y1={gridY}
                y2={gridY}
                className="stroke-border"
                strokeDasharray="3 4"
              />
              <text
                x={left - 8}
                y={gridY + 4}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="11"
              >
                {Math.round(value)}
                {metric === "excellentPercent" ? "%" : ""}
              </text>
            </g>
          );
        })}
        {metric === "total" ? (
          items.map((item, index) => {
            const barWidth = Math.max(
              3,
              Math.min(24, (plotWidth / items.length) * 0.62),
            );
            return (
              <rect
                key={item.bucket}
                x={x(index) - barWidth / 2}
                y={y(item.total)}
                width={barWidth}
                height={Math.max(0, top + plotHeight - y(item.total))}
                rx="3"
                fill={color}
              >
                <title>{`${item.bucket}: ${item.total} avaliações`}</title>
              </rect>
            );
          })
        ) : (
          <>
            <polyline
              points={points.join(" ")}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {items.map((item, index) => (
              <circle
                key={item.bucket}
                cx={x(index)}
                cy={y(item[metric])}
                r="4"
                fill={color}
              >
                <title>
                  {`${item.bucket}: ${item[metric]}${metric === "excellentPercent" ? "%" : ""}`}
                </title>
              </circle>
            ))}
          </>
        )}
        {items.map(
          (item, index) =>
            index % labelStep === 0 || index === items.length - 1 ? (
              <text
                key={item.bucket}
                x={x(index)}
                y={height - 12}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="10"
              >
                {item.label}
              </text>
            ) : null,
        )}
      </svg>
    </div>
  );
}

export function DashboardCharts({
  summary,
  trend,
  improvements,
  employees,
}: {
  summary: {
    total: number;
    excellent: number;
    regular: number;
    poor: number;
    negative: number;
    npsDistribution: number[];
  };
  trend: TrendItem[];
  improvements: Array<{ reason: string; total: number }>;
  employees: EmployeeItem[];
}) {
  const scoreItems = [
    { label: "Excelente", count: summary.excellent },
    { label: "Regular", count: summary.regular },
    { label: "Ruim", count: summary.poor },
  ];
  const npsItems = summary.npsDistribution.map((count, note) => ({
    label: `Nota ${note}`,
    count,
  }));

  return (
    <div className="mt-8 flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Avaliação do atendimento</CardTitle>
          <CardDescription>
            Distribuição das respostas Ruim, Regular e Excelente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarList
            items={scoreItems}
            total={summary.total}
            emptyMessage="Ainda não há avaliações neste período."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição das notas de recomendação</CardTitle>
          <CardDescription>
            Notas de 0 a 6 são detratores, 7 e 8 são neutros e 9 e 10 são
            promotores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarList
            items={npsItems}
            total={summary.total}
            emptyMessage="Ainda não há avaliações neste período."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume de avaliações ao longo do tempo</CardTitle>
          <CardDescription>
            Respostas por dia, semana ou mês, conforme o período selecionado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart items={trend} metric="total" color="#2563eb" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Percentual de atendimentos excelentes</CardTitle>
          <CardDescription>
            Evolução da proporção de notas “Excelente” em cada intervalo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart
            items={trend}
            metric="excellentPercent"
            color="#059669"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do NPS</CardTitle>
          <CardDescription>
            NPS por intervalo, calculado como promotores menos detratores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrendChart items={trend} metric="nps" color="#7c3aed" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pontos de melhoria mais citados</CardTitle>
          <CardDescription>
            Motivos selecionados por clientes com nota de recomendação entre 0
            e 4. Percentuais usam esse grupo como base.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarList
            items={improvements.map(({ reason, total }) => ({
              label: reason,
              count: total,
            }))}
            total={improvements.reduce((sum, item) => sum + item.total, 0)}
            percentageBase={summary.negative}
            emptyMessage="Não há pontos de melhoria selecionados neste período."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avaliações por funcionário</CardTitle>
          <CardDescription>
            Distribuição das notas de atendimento por funcionário, com NPS e
            quantidade de respostas. Funcionários abaixo do mínimo escolhido
            ficam ocultos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum funcionário atingiu o mínimo de avaliações neste período.
            </p>
          ) : (
            <div className="space-y-6">
              {employees.map((employee) => (
                <div key={employee.id}>
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                    <span className="font-semibold">{employee.name}</span>
                    <span className="text-muted-foreground">
                      NPS {employee.nps} · {employee.total} avaliações
                    </span>
                  </div>
                  <div
                    className="flex h-4 overflow-hidden rounded-full bg-muted"
                    role="img"
                    aria-label={`${employee.name}: ${employee.excellent} excelentes, ${employee.regular} regulares, ${employee.poor} ruins, NPS ${employee.nps}, ${employee.total} avaliações`}
                  >
                    <div
                      className="bg-emerald-500"
                      style={{
                        width: `${percent(employee.excellent, employee.total)}%`,
                      }}
                    />
                    <div
                      className="bg-amber-400"
                      style={{
                        width: `${percent(employee.regular, employee.total)}%`,
                      }}
                    />
                    <div
                      className="bg-red-500"
                      style={{
                        width: `${percent(employee.poor, employee.total)}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Excelente: {employee.excellent}</span>
                    <span>Regular: {employee.regular}</span>
                    <span>Ruim: {employee.poor}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              Excelente
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-400" />
              Regular
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-500" />
              Ruim
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
