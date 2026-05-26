import { Trash2, RefreshCw, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { frequencyLabel, toMonthly, daysUntil } from "@/lib/subscriptions";
import { SubscriptionForm } from "./subscription-form";
import {
  deleteSubscription,
  toggleSubscriptionStatus,
  rolloverSubscription,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function SuscripcionesPage() {
  const user = await requireUser();

  const subs = await prisma.subscription.findMany({
    where: { ownerId: user.id },
    orderBy: [{ status: "asc" }, { nextRenewal: "asc" }],
  });

  const active = subs.filter((s) => s.status === "ACTIVE");
  const monthlyTotal = active.reduce(
    (sum, s) => sum + toMonthly(Number(s.amount), s.frequency),
    0,
  );
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Suscripciones</h1>
          <p className="text-sm text-muted-foreground">
            {active.length} activas · {formatCurrency(monthlyTotal)} / mes ·{" "}
            {formatCurrency(yearlyTotal)} / ano
          </p>
        </div>
        <SubscriptionForm />
      </header>

      {subs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            Sin suscripciones registradas. Agrega tus servicios recurrentes para llevar
            control de cuanto bleeding mensual tienes.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Servicio</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Frecuencia</th>
                  <th className="px-5 py-3 text-right font-medium">Monto</th>
                  <th className="px-5 py-3 font-medium">Proxima renovacion</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => {
                  const days = daysUntil(s.nextRenewal);
                  const isActive = s.status === "ACTIVE";
                  const urgent = isActive && days <= 7;
                  const overdue = isActive && days < 0;

                  return (
                    <tr
                      key={s.id}
                      className={`border-t border-border ${
                        !isActive ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium">{s.name}</div>
                        {s.provider && (
                          <div className="text-xs text-muted-foreground">{s.provider}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{s.category}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {frequencyLabel(s.frequency)}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatCurrency(Number(s.amount))}
                      </td>
                      <td className="px-5 py-3">
                        <div>{formatDate(s.nextRenewal)}</div>
                        {isActive && (
                          <div
                            className={`text-xs ${
                              overdue
                                ? "text-red-500"
                                : urgent
                                  ? "text-amber-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {overdue
                              ? `Vencida hace ${Math.abs(days)} dias`
                              : days === 0
                                ? "Hoy"
                                : `En ${days} dias`}
                          </div>
                        )}
                        {!isActive && (
                          <div className="text-xs text-muted-foreground">Cancelada</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isActive && (
                            <form action={rolloverSubscription}>
                              <input type="hidden" name="id" value={s.id} />
                              <button
                                type="submit"
                                className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                title="Marcar como renovada (avanza fecha)"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </form>
                          )}
                          <form action={toggleSubscriptionStatus}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="status" value={s.status} />
                            <button
                              type="submit"
                              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                              title={isActive ? "Cancelar" : "Reactivar"}
                            >
                              <Power size={14} />
                            </button>
                          </form>
                          <form action={deleteSubscription}>
                            <input type="hidden" name="id" value={s.id} />
                            <button
                              type="submit"
                              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-red-500"
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
