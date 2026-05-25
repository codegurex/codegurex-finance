"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type CategoryDatum = { category: string; amount: number };

const COLORS = [
  "#2563eb", // primary blue
  "#22c55e", // code green
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ExpensesByCategoryChart({ data }: { data: CategoryDatum[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        Sin gastos este mes.
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="grid h-72 grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
      <div className="min-h-0 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => currency.format(Number(v))}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>

      <div className="flex flex-col justify-center gap-2 text-sm">
        {data.map((d, i) => {
          const pct = total > 0 ? (d.amount / total) * 100 : 0;
          return (
            <div key={d.category} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="truncate">{d.category}</span>
              <span className="ml-auto text-muted-foreground">
                {currency.format(d.amount)}{" "}
                <span className="text-xs">({pct.toFixed(0)}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
