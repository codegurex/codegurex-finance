import { Trash2, Target, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  progressPct,
  monthlyNeeded,
  daysUntilDeadline,
} from "@/lib/goals";
import { cn } from "@/lib/utils";
import { GoalForm } from "./goal-form";
import { ContributeButton } from "./contribute-button";
import { deleteGoal } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Activa", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completada", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelada", className: "bg-red-100 text-red-700" },
};

export default async function MetasPage() {
  const user = await requireUser();

  const goals = await prisma.goal.findMany({
    where: { ownerId: user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const totalTarget = activeGoals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const totalCurrent = activeGoals.reduce((s, g) => s + Number(g.currentAmount), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground">
            {activeGoals.length} activas · {formatCurrency(totalCurrent)} de{" "}
            {formatCurrency(totalTarget)} acumulado
          </p>
        </div>
        <GoalForm />
      </header>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target size={32} className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              Sin metas todavia. Define tu primer objetivo de ahorro para
              empezar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {goals.map((g) => {
            const current = Number(g.currentAmount);
            const target = Number(g.targetAmount);
            const pct = progressPct(current, target);
            const remaining = Math.max(0, target - current);
            const days = daysUntilDeadline(g.deadline);
            const monthly = monthlyNeeded(current, target, g.deadline);
            const status = STATUS_LABEL[g.status] ?? STATUS_LABEL.ACTIVE;
            const isComplete = g.status === "COMPLETED";
            const isActive = g.status === "ACTIVE";

            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{g.name}</h3>
                    <span
                      className={cn(
                        "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GoalForm
                      editing={{
                        id: g.id,
                        name: g.name,
                        targetAmount: Number(g.targetAmount),
                        currentAmount: Number(g.currentAmount),
                        deadline: g.deadline,
                        status: g.status,
                        notes: g.notes,
                      }}
                    />
                    <form action={deleteGoal}>
                      <input type="hidden" name="id" value={g.id} />
                      <button
                        type="submit"
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xl font-semibold">
                      {formatCurrency(current)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      de {formatCurrency(target)}
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full transition-all",
                        isComplete ? "bg-green-500" : "bg-primary",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{pct.toFixed(0)}% completado</span>
                    {!isComplete && (
                      <span>Faltan {formatCurrency(remaining)}</span>
                    )}
                  </div>
                </div>

                {g.deadline && isActive && (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={12} />
                      <span>
                        {days !== null && days > 0
                          ? `${days} dias para ${formatDate(g.deadline)}`
                          : days === 0
                            ? "Vence hoy"
                            : `Vencida hace ${Math.abs(days ?? 0)} dias`}
                      </span>
                    </div>
                    {monthly !== null && monthly > 0 && (
                      <div className="text-right">
                        <span className="text-muted-foreground">Ahorra </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(monthly)}
                        </span>
                        <span className="text-muted-foreground"> / mes</span>
                      </div>
                    )}
                  </div>
                )}

                {g.notes && (
                  <p className="mt-3 text-xs text-muted-foreground">{g.notes}</p>
                )}

                <div className="mt-4 flex justify-end">
                  {isComplete ? (
                    <div className="flex items-center gap-1.5 text-sm text-green-600">
                      <CheckCircle2 size={16} />
                      <span className="font-medium">Meta cumplida</span>
                    </div>
                  ) : isActive ? (
                    <ContributeButton goalId={g.id} goalName={g.name} />
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
