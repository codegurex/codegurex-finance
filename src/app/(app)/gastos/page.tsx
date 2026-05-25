import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/categories";
import { ExpenseForm } from "./expense-form";
import { deleteExpense } from "./actions";

export const dynamic = "force-dynamic";

function methodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export default async function GastosPage() {
  const user = await requireUser();

  const expenses = await prisma.expense.findMany({
    where: { ownerId: user.id },
    orderBy: { date: "desc" },
    take: 100,
  });

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gastos</h1>
          <p className="text-sm text-muted-foreground">
            {expenses.length} registros · Total {formatCurrency(total)}
          </p>
        </div>
        <ExpenseForm />
      </header>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            Sin gastos registrados todavia.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Descripcion</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Metodo</th>
                  <th className="px-5 py-3 text-right font-medium">Monto</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-5 py-3">{row.description}</td>
                    <td className="px-5 py-3 text-muted-foreground">{row.category}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {row.provider ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {methodLabel(row.paymentMethod)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-red-500">
                      {formatCurrency(Number(row.amount))}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={deleteExpense}>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
