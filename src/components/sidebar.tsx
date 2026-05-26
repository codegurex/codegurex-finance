"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  FileText,
  Repeat,
  Briefcase,
  Target,
  LogOut,
  TerminalSquare,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ingresos", label: "Ingresos", icon: TrendingUp },
  { href: "/empleos", label: "Empleos", icon: Briefcase },
  { href: "/gastos", label: "Gastos", icon: TrendingDown },
  { href: "/suscripciones", label: "Suscripciones", icon: Repeat },
  { href: "/metas", label: "Metas", icon: Target },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/proyectos", label: "Proyectos", icon: FolderKanban },
  { href: "/facturas", label: "Facturas", icon: FileText, disabled: true },
];

export function Sidebar({ email }: { email?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Cierra el drawer al navegar (mobile).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquea scroll del body cuando el drawer mobile esta abierto.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <>
      {/* Topbar mobile (con hamburguesa) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 font-mono text-sm font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TerminalSquare size={14} />
          </span>
          <span>
            <span className="text-primary">&lt;</span>
            Codegurex
            <span className="text-primary">/&gt;</span>
          </span>
        </div>
        <ThemeToggle compact />
      </header>

      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — mobile drawer / desktop fijo */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-6",
          "transform transition-transform duration-200 ease-out",
          "md:static md:h-screen md:w-60 md:translate-x-0 md:bg-muted/40",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-start justify-between px-2 pb-6">
          <div>
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
          {/* Cerrar — solo mobile */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] uppercase tracking-wider">
                    Pronto
                  </span>
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
            <div className="truncate px-3 pb-2 text-xs text-muted-foreground">
              {email}
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut size={16} />
            Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
}
