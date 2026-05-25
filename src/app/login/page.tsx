import { TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TerminalSquare size={20} />
          </div>
          <div className="font-mono text-xl font-semibold tracking-tight">
            <span className="text-primary">&lt;</span>
            Codegurex
            <span className="text-primary">/&gt;</span>
          </div>
          <p className="mt-1 font-mono text-xs text-[color:var(--code)]">$ finance</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Inicia sesion para administrar tus finanzas
          </p>
        </div>

        <form className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Correo
            </label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Contrasena
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          {params.error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {params.error}
            </div>
          )}
          {params.message && (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
              {params.message}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button formAction={login} className="flex-1">
              Entrar
            </Button>
            <Button formAction={signup} variant="outline" className="flex-1">
              Crear cuenta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
