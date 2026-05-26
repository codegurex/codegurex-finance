import { Trash2, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/categories";
import { IncomeForm } from "./income-form";
import { deleteIncome } from "./actions";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function methodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export default async function IngresosPage() {
  const user = await requireUser();

  const [income, clients, expensesAgg] = await Promise.all([
    prisma.income.findMany({
      where: { ownerId: user.id },
      orderBy: { date: "desc" },
      take: 100,
      include: { client: { select: { id: true, name: true, company: true } } },
    }),
    prisma.client.findMany({
      where: { ownerId: user.id, status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { ownerId: user.id },
    }),
  ]);

  const total = income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = Number(expensesAgg._sum.amount ?? 0);
  const saldo = total - totalExpenses;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Ingresos</h1>
            <p className="text-sm text-muted-foreground">
              {income.length} registros · Total {formatCurrency(total)}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <Wallet size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Saldo:</span>
            <span
              className={cn(
                "font-semibold",
                saldo >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              {formatCurrency(saldo)}
            </span>
            <span className="text-xs text-muted-foreground">
              (ingresos − gastos)
            </span>
          </div>
        </div>
        <IncomeForm clients={clients} />
      </header>

      {income.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            Aun no hay ingresos. Registra el primero arriba.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Metodo</th>
                  <th className="px-5 py-3 font-medium">Notas</th>
                  <th className="px-5 py-3 text-right font-medium">Monto</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {income.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-5 py-3">
                      {row.client ? (
                        <span>
                          {row.client.name}
                          {row.client.company && (
                            <span className="text-muted-foreground"> · {row.client.company}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{row.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {methodLabel(row.paymentMethod)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground truncate max-w-xs">
                      {row.notes ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-green-600">
                      {formatCurrency(Number(row.amount))}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteIncome}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="text-muted-foreground hover:text-red-500"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
