import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { daysUntil } from "@/lib/subscriptions";

type Renewal = {
  id: string;
  name: string;
  amount: number;
  nextRenewal: Date;
};

export function RenewalAlert({ items }: { items: Renewal[] }) {
  if (items.length === 0) return null;

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <Link
      href="/suscripciones"
      className="block rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100/70"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
            {items.length} {items.length === 1 ? "renovacion" : "renovaciones"} en los
            proximos 14 dias · {formatCurrency(total)}
          </div>
          <ul className="mt-1 space-y-0.5 text-xs text-amber-700/90">
            {items.slice(0, 4).map((r) => {
              const days = daysUntil(r.nextRenewal);
              return (
                <li key={r.id}>
                  {r.name} · {formatCurrency(r.amount)} ·{" "}
                  {days < 0
                    ? `vencida hace ${Math.abs(days)} dias`
                    : days === 0
                      ? "hoy"
                      : `en ${days} dias`}{" "}
                  ({formatDate(r.nextRenewal)})
                </li>
              );
            })}
            {items.length > 4 && (
              <li className="opacity-70">+ {items.length - 4} mas...</li>
            )}
          </ul>
        </div>
        <ChevronRight size={16} className="mt-0.5 text-amber-600" />
      </div>
    </Link>
  );
}
