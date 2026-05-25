import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon?: LucideIcon;
}

export function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon size={16} className="text-muted-foreground" />}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      {delta && (
        <div
          className={cn(
            "mt-1 text-xs",
            delta.positive ? "text-green-600" : "text-red-600",
          )}
        >
          {delta.value}
        </div>
      )}
    </Card>
  );
}
