import { TrendingUp, TrendingDown, Wallet, Repeat } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { RenewalAlert } from "@/components/renewal-alert";
import {
  IncomeVsExpensesChart,
  type MonthlyDatum,
} from "@/components/charts/income-vs-expenses";
import {
  ExpensesByCategoryChart,
  type CategoryDatum,
} from "@/components/charts/expenses-by-category";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { toMonthly } from "@/lib/subscriptions";

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default async function DashboardPage() {
  const user = await requireUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  // Inicio de hace 5 meses (para incluir el actual = 6 meses)
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Ventana para alertas de renovacion (14 dias).
  const renewalCutoff = new Date();
  renewalCutoff.setDate(renewalCutoff.getDate() + 14);

  const [
    incomeTotal,
    expensesTotal,
    incomeMonth,
    expensesMonth,
    recent,
    incomeLastSix,
    expensesLastSix,
    expenseByCategory,
    activeSubs,
    upcomingRenewals,
  ] = await Promise.all([
    // Totales acumulados (todo el historico del usuario).
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { ownerId: user.id },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { ownerId: user.id },
    }),
    // Mes en curso (para mostrar como sub-texto).
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { ownerId: user.id, date: { gte: monthStart } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { ownerId: user.id, date: { gte: monthStart } },
    }),
    prisma.income.findMany({
      where: { ownerId: user.id },
      orderBy: { date: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    prisma.income.findMany({
      where: { ownerId: user.id, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: { ownerId: user.id, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: { ownerId: user.id, date: { gte: monthStart } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.subscription.findMany({
      where: { ownerId: user.id, status: "ACTIVE" },
      select: { amount: true, frequency: true },
    }),
    prisma.subscription.findMany({
      where: {
        ownerId: user.id,
        status: "ACTIVE",
        nextRenewal: { lte: renewalCutoff },
      },
      orderBy: { nextRenewal: "asc" },
      select: { id: true, name: true, amount: true, nextRenewal: true },
    }),
  ]);

  const income = Number(incomeTotal._sum.amount ?? 0);
  const expenses = Number(expensesTotal._sum.amount ?? 0);
  const incomeThisMonth = Number(incomeMonth._sum.amount ?? 0);
  const expensesThisMonth = Number(expensesMonth._sum.amount ?? 0);
  const balance = income - expenses;
  const monthlyBurn = activeSubs.reduce(
    (sum, s) => sum + toMonthly(Number(s.amount), s.frequency),
    0,
  );
  const renewals = upcomingRenewals.map((r) => ({
    id: r.id,
    name: r.name,
    amount: Number(r.amount),
    nextRenewal: r.nextRenewal,
  }));

  // Agrega ingresos/gastos por mes para los ultimos 6 meses.
  const monthlyBuckets = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: monthKey(d),
      month: MONTH_LABELS[d.getMonth()],
      ingresos: 0,
      gastos: 0,
    };
  });
  const monthlyMap = new Map(monthlyBuckets.map((m) => [m.key, m]));
  for (const row of incomeLastSix) {
    const slot = monthlyMap.get(monthKey(row.date));
    if (slot) slot.ingresos += Number(row.amount);
  }
  for (const row of expensesLastSix) {
    const slot = monthlyMap.get(monthKey(row.date));
    if (slot) slot.gastos += Number(row.amount);
  }
  const monthlyClean: MonthlyDatum[] = monthlyBuckets.map(({ month, ingresos, gastos }) => ({
    month,
    ingresos,
    gastos,
  }));

  const categoryData: CategoryDatum[] = expenseByCategory.map((row) => ({
    category: row.category,
    amount: Number(row._sum.amount ?? 0),
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Totales acumulados · debajo de cada card, lo que llevas este mes
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ingresos totales"
          value={formatCurrency(income)}
          delta={
            incomeThisMonth > 0
              ? { value: `+${formatCurrency(incomeThisMonth)} este mes`, positive: true }
              : undefined
          }
          icon={TrendingUp}
        />
        <StatCard
          label="Saldo"
          value={formatCurrency(balance)}
          delta={
            balance !== 0
              ? balance > 0
                ? { value: "positivo", positive: true }
                : { value: "en negativo", positive: false }
              : undefined
          }
          icon={Wallet}
        />
        <StatCard
          label="Gastos totales"
          value={formatCurrency(expenses)}
          delta={
            expensesThisMonth > 0
              ? { value: `+${formatCurrency(expensesThisMonth)} este mes`, positive: false }
              : undefined
          }
          icon={TrendingDown}
        />
        <StatCard
          label="Burn mensual (subs)"
          value={formatCurrency(monthlyBurn)}
          icon={Repeat}
        />
      </div>

      <RenewalAlert items={renewals} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Ingresos vs gastos · ultimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeVsExpensesChart data={monthlyClean} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gastos por categoria · {MONTH_LABELS[now.getMonth()]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesByCategoryChart data={categoryData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultimas transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Sin movimientos todavia.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">Cliente</th>
                  <th className="py-2 font-medium">Categoria</th>
                  <th className="py-2 font-medium">Fecha</th>
                  <th className="py-2 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="py-3">{row.client?.name ?? "—"}</td>
                    <td className="py-3 text-muted-foreground">{row.category}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(row.date)}</td>
                    <td className="py-3 text-right font-medium text-green-600">
                      {formatCurrency(Number(row.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}
