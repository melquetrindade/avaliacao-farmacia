import { db } from "../../_lib/prisma";

export const dashboardMinimums = [1, 3, 5, 10] as const;
const dashboardTimeZone = "America/Sao_Paulo";

type Summary = {
  total: number;
  excellent: number;
  regular: number;
  poor: number;
  negative: number;
  promoters: number;
  passives: number;
  detractors: number;
  nps: number;
  npsDistribution: number[];
};

type TrendRow = {
  bucket: string;
  total: number;
  excellent: number;
  promoters: number;
  detractors: number;
};

function summarize(
  groups: Array<{
    atendimentoNota: number;
    nps: number;
    _count: { _all: number };
  }>,
): Summary {
  const summary: Summary = {
    total: 0,
    excellent: 0,
    regular: 0,
    poor: 0,
    negative: 0,
    promoters: 0,
    passives: 0,
    detractors: 0,
    nps: 0,
    npsDistribution: Array.from({ length: 11 }, () => 0),
  };

  for (const group of groups) {
    const count = group._count._all;
    summary.total += count;

    if (group.atendimentoNota === 3) summary.excellent += count;
    else if (group.atendimentoNota === 2) summary.regular += count;
    else if (group.atendimentoNota === 1) summary.poor += count;

    summary.npsDistribution[group.nps] += count;
    if (group.nps <= 4) summary.negative += count;
    if (group.nps >= 9) summary.promoters += count;
    else if (group.nps >= 7) summary.passives += count;
    else summary.detractors += count;
  }

  summary.nps =
    summary.total === 0
      ? 0
      : Math.round(
          ((summary.promoters - summary.detractors) / summary.total) * 100,
        );

  return summary;
}

function getDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: dashboardTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function dateAtSaoPauloTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
) {
  const target = Date.UTC(year, month - 1, day, hour, minute, second);
  let timestamp = target;

  for (let iteration = 0; iteration < 3; iteration += 1) {
    const parts = getDateParts(new Date(timestamp));
    const observed = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    timestamp += target - observed;
  }

  return new Date(timestamp);
}

function getMonthRange(month: string, now: Date) {
  const [year, monthNumber] = month.split("-").map(Number);
  const start = dateAtSaoPauloTime(year, monthNumber, 1);
  const nextMonth =
    monthNumber === 12
      ? dateAtSaoPauloTime(year + 1, 1, 1)
      : dateAtSaoPauloTime(year, monthNumber + 1, 1);
  const previousStart =
    monthNumber === 1
      ? dateAtSaoPauloTime(year - 1, 12, 1)
      : dateAtSaoPauloTime(year, monthNumber - 1, 1);
  const currentParts = getDateParts(now);
  const isCurrentMonth =
    currentParts.year === year && currentParts.month === monthNumber;
  const end = isCurrentMonth ? now : nextMonth;
  let previousEnd = start;

  if (isCurrentMonth) {
    const previousMonthDays = new Date(
      Date.UTC(year, monthNumber - 1, 0),
    ).getUTCDate();
    previousEnd = dateAtSaoPauloTime(
      monthNumber === 1 ? year - 1 : year,
      monthNumber === 1 ? 12 : monthNumber - 1,
      Math.min(currentParts.day, previousMonthDays),
      currentParts.hour,
      currentParts.minute,
      currentParts.second,
    );
  }

  return {
    current: { createdAt: { gte: start, lt: end } },
    previous: { createdAt: { gte: previousStart, lt: previousEnd } },
    start,
    end,
    isCurrentMonth,
    daysToShow: isCurrentMonth
      ? currentParts.day
      : new Date(Date.UTC(year, monthNumber, 0)).getUTCDate(),
  };
}

export async function getDashboardData(
  month: string,
  minimumResponses: number,
) {
  const now = new Date();
  const {
    current,
    previous,
    start,
    end,
    daysToShow,
  } = getMonthRange(month, now);

  const [
    currentGroups,
    previousGroups,
    ratingByEmployee,
    npsByEmployee,
    improvementRows,
    trendRows,
  ] = await Promise.all([
    db.avaliacaoAtendimento.groupBy({
      by: ["atendimentoNota", "nps"],
      where: current,
      _count: { _all: true },
    }),
    previous
      ? db.avaliacaoAtendimento.groupBy({
          by: ["atendimentoNota", "nps"],
          where: previous,
          _count: { _all: true },
        })
      : Promise.resolve(null),
    db.avaliacaoAtendimento.groupBy({
      by: ["colaboradorId", "atendimentoNota"],
      where: current,
      _count: { _all: true },
    }),
    db.avaliacaoAtendimento.groupBy({
      by: ["colaboradorId", "nps"],
      where: current,
      _count: { _all: true },
    }),
    db.$queryRaw<Array<{ reason: string; total: number }>>`
      SELECT improvements.reason, COUNT(*)::int AS total
      FROM "AvaliacaoAtendimento"
      CROSS JOIN LATERAL unnest("melhoria") AS improvements(reason)
      WHERE "nps" <= 4
        AND "createdAt" >= ${start}
        AND "createdAt" < ${end}
      GROUP BY improvements.reason
      ORDER BY total DESC, improvements.reason ASC
    `,
    db.$queryRaw<TrendRow[]>`
      SELECT
        to_char(
          date_trunc('day', "createdAt" AT TIME ZONE ${dashboardTimeZone}),
          'YYYY-MM-DD'
        ) AS bucket,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE "atendimentoNota" = 3)::int AS excellent,
        COUNT(*) FILTER (WHERE "nps" >= 9)::int AS promoters,
        COUNT(*) FILTER (WHERE "nps" <= 6)::int AS detractors
      FROM "AvaliacaoAtendimento"
      WHERE "createdAt" >= ${start}
        AND "createdAt" < ${end}
      GROUP BY 1
      ORDER BY bucket ASC
    `,
  ]);

  const summary = summarize(currentGroups);
  const previousSummary = previousGroups ? summarize(previousGroups) : null;
  const employeeIds = new Set([
    ...ratingByEmployee.map((group) => group.colaboradorId),
    ...npsByEmployee.map((group) => group.colaboradorId),
  ]);
  const employees = employeeIds.size
    ? await db.colaborador.findMany({
        where: { id: { in: [...employeeIds] } },
        select: { id: true, nome: true },
      })
    : [];
  const employeeNames = new Map(employees.map(({ id, nome }) => [id, nome]));
  const employeeStats = new Map<
    string,
    {
      id: string;
      name: string;
      total: number;
      excellent: number;
      regular: number;
      poor: number;
      promoters: number;
      passives: number;
      detractors: number;
    }
  >();

  for (const group of ratingByEmployee) {
    const stats = employeeStats.get(group.colaboradorId) ?? {
      id: group.colaboradorId,
      name: employeeNames.get(group.colaboradorId) ?? "Funcionário",
      total: 0,
      excellent: 0,
      regular: 0,
      poor: 0,
      promoters: 0,
      passives: 0,
      detractors: 0,
    };
    const count = group._count._all;
    stats.total += count;
    if (group.atendimentoNota === 3) stats.excellent += count;
    else if (group.atendimentoNota === 2) stats.regular += count;
    else if (group.atendimentoNota === 1) stats.poor += count;
    employeeStats.set(group.colaboradorId, stats);
  }

  for (const group of npsByEmployee) {
    const stats = employeeStats.get(group.colaboradorId);
    if (!stats) continue;
    if (group.nps >= 9) stats.promoters += group._count._all;
    else if (group.nps >= 7) stats.passives += group._count._all;
    else stats.detractors += group._count._all;
  }

  const employeeResults = [...employeeStats.values()]
    .filter((employee) => employee.total >= minimumResponses)
    .map((employee) => ({
      ...employee,
      nps: Math.round(
        ((employee.promoters - employee.detractors) / employee.total) * 100,
      ),
    }))
    .sort((a, b) => b.nps - a.nps || b.total - a.total);
  const trendsByDay = new Map(trendRows.map((row) => [row.bucket, row]));
  const trend = Array.from({ length: daysToShow }, (_, index) => {
    const day = index + 1;
    const bucket = `${month}-${String(day).padStart(2, "0")}`;
    const row = trendsByDay.get(bucket) ?? {
      bucket,
      total: 0,
      excellent: 0,
      promoters: 0,
      detractors: 0,
    };

    return {
      ...row,
      label: String(day).padStart(2, "0"),
      excellentPercent:
        row.total === 0 ? 0 : Math.round((row.excellent / row.total) * 100),
      nps:
        row.total === 0
          ? 0
          : Math.round(((row.promoters - row.detractors) / row.total) * 100),
    };
  });

  return {
    summary,
    previousSummary,
    improvements: improvementRows,
    employees: employeeResults,
    trend,
  };
}
