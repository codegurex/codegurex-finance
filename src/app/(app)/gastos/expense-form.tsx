"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import { createExpense } from "./actions";

export function ExpenseForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createExpense(formData);
        formRef.current?.reset();
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> Nuevo gasto
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Nuevo gasto</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <Field label="Descripcion">
          <Input name="description" required placeholder="Ej. Hosting Vercel - noviembre" />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Monto (USD)">
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="20.00"
            />
          </Field>

          <Field label="Fecha">
            <Input name="date" type="date" defaultValue={today} required />
          </Field>

          <Field label="Categoria">
            <Select name="category" defaultValue={EXPENSE_CATEGORIES[0]} required>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Metodo de pago">
            <Select name="paymentMethod" defaultValue="TRANSFER" required>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Proveedor (opcional)">
            <Input name="provider" placeholder="Vercel, OpenAI, etc." />
          </Field>

          <Field label="Notas (opcional)">
            <Input name="notes" placeholder="Detalles" />
          </Field>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar gasto"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
