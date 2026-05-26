import { Trash2, BadgeCheck, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  payFrequencyLabel,
  projectedMonthly,
  daysUntilPay,
} from "@/lib/jobs";
import { JobForm } from "./job-form";
import { deleteJob, toggleJobStatus, registerJobPayment } from "./actions";

export const dynamic = "force-dynamic";

export default async function EmpleosPage() {
  const user = await requireUser();

  const jobs = await prisma.job.findMany({
    where: { ownerId: user.id },
    orderBy: [{ status: "asc" }, { nextPayDate: "asc" }],
  });

  const active = jobs.filter((j) => j.status === "ACTIVE");
  const monthlyProjected = active.reduce(
    (sum, j) => sum + projectedMonthly(Number(j.salary), j.frequency),
    0,
  );
  const yearlyProjected = monthlyProjected * 12;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empleos</h1>
          <p className="text-sm text-muted-foreground">
            {active.length} activos · {formatCurrency(monthlyProjected)} / mes
            proyectado · {formatCurrency(yearlyProjected)} / ano
          </p>
        </div>
        <JobForm />
      </header>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            Sin empleos registrados. Agrega tu sueldo o cualquier ingreso recurrente
            por trabajo para proyectar cuanto vas a cobrar cada mes.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Empleador</th>
                  <th className="px-5 py-3 font-medium">Puesto</th>
                  <th className="px-5 py-3 font-medium">Frecuencia</th>
                  <th className="px-5 py-3 text-right font-medium">Sueldo</th>
                  <th className="px-5 py-3 font-medium">Proximo pago</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => {
                  const isActive = j.status === "ACTIVE";
                  const days = daysUntilPay(j.nextPayDate);
                  const due = isActive && days <= 0;
                  const close = isActive && days > 0 && days <= 3;

                  return (
                    <tr
                      key={j.id}
                      className={`border-t border-border ${!isActive ? "opacity-50" : ""}`}
                    >
                      <td className="px-5 py-3 font-medium">{j.employer}</td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {j.position ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {payFrequencyLabel(j.frequency)}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-green-600">
                        {formatCurrency(Number(j.salary))}
                      </td>
                      <td className="px-5 py-3">
                        <div>{formatDate(j.nextPayDate)}</div>
                        {isActive ? (
                          <div
                            className={`text-xs ${
                              due
                                ? "text-red-600"
                                : close
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {due
                              ? days < 0
                                ? `Vencido hace ${Math.abs(days)} dias`
                                : "Hoy"
                              : `En ${days} dias`}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Finalizado</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {isActive && (
                            <form action={registerJobPayment}>
                              <input type="hidden" name="id" value={j.id} />
                              <button
                                type="submit"
                                className="rounded p-1.5 text-muted-foreground hover:bg-green-100 hover:text-green-700"
                                title="Registrar pago (crea ingreso y avanza fecha)"
                              >
                                <BadgeCheck size={14} />
                              </button>
                            </form>
                          )}
                          <form action={toggleJobStatus}>
                            <input type="hidden" name="id" value={j.id} />
                            <input type="hidden" name="status" value={j.status} />
                            <button
                              type="submit"
                              className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                              title={isActive ? "Marcar como finalizado" : "Reactivar"}
                            >
                              <Power size={14} />
                            </button>
                          </form>
                          <form action={deleteJob}>
                            <input type="hidden" name="id" value={j.id} />
                            <button
                              type="submit"
                              className="rounded p-1.5 text-muted-foreground hover:text-red-600"
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

      <Card className="border-dashed">
        <CardContent className="p-5 text-sm text-muted-foreground">
          <strong className="text-foreground">Como funciona:</strong> el boton{" "}
          <BadgeCheck size={14} className="inline align-text-bottom text-green-600" />{" "}
          registra que ya cobraste — crea automaticamente un ingreso con el monto del
          sueldo y avanza la fecha del proximo pago segun la frecuencia.
        </CardContent>
      </Card>
    </div>
  );
}
