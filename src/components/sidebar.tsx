"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  FileText,
  Repeat,
  Briefcase,
  LogOut,
  TerminalSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/empleos", label: "Empleos", icon: Briefcase },
  { href: "/gastos", label: "Gastos", icon: TrendingDown },
  { href: "/suscripciones", label: "Suscripciones", icon: Repeat },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/facturas", label: "Facturas", icon: FileText, disabled: true },
];

export function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-muted/40 px-4 py-6">
      <div className="px-2 pb-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TerminalSquare size={18} />
          </span>
          <span className="font-mono text-base font-semibold tracking-tight">
            <span className="text-primary">&lt;</span>
            Codegurex
            <span className="text-primary">/&gt;</span>
          </span>
        </div>
        <div className="mt-1 pl-10 font-mono text-xs text-[color:var(--code)]">
          $ finance
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
              >
                <Icon size={16} />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] uppercase tracking-wider">Pronto</span>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        {email && (
          <div className="truncate px-3 pb-2 text-xs text-muted-foreground">{email}</div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
