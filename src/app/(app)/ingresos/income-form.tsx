"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { INCOME_CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import { createIncome, updateIncome } from "./actions";

type ClientOption = { id: string; name: string; company: string | null };

export type IncomeEditing = {
  id: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: Date;
  notes: string | null;
  clientId: string | null;
};

export function IncomeForm({
  clients = [],
  editing,
}: {
  clients?: ClientOption[];
  editing?: IncomeEditing;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = !!editing;
  const today = new Date().toISOString().slice(0, 10);
  const defaultDate = editing
    ? new Date(editing.date).toISOString().slice(0, 10)
    : today;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (isEdit && editing) {
          formData.append("id", editing.id);
          await updateIncome(formData);
        } else {
          await createIncome(formData);
          formRef.current?.reset();
        }
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  if (!open) {
    if (isEdit) {
      return (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Editar"
          title="Editar"
        >
          <Pencil size={16} />
        </button>
      );
    }
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> Nuevo ingreso
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop solo en modo edicion (modal). Modo create es inline. */}
      {isEdit && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <Card
        className={
          isEdit
            ? "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 p-5 shadow-xl"
            : "p-5"
        }
      >
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              {isEdit ? "Editar ingreso" : "Nuevo ingreso"}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Monto (USD)">
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="1500.00"
                defaultValue={editing?.amount}
              />
            </Field>

            <Field label="Fecha">
              <Input name="date" type="date" defaultValue={defaultDate} required />
            </Field>

            <Field label="Categoria">
              <Select
                name="category"
                defaultValue={editing?.category ?? INCOME_CATEGORIES[0]}
                required
              >
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Metodo de pago">
              <Select
                name="paymentMethod"
                defaultValue={editing?.paymentMethod ?? "TRANSFER"}
                required
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Cliente (opcional)">
              <Select name="clientId" defaultValue={editing?.clientId ?? ""}>
                <option value="">— Sin cliente —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.name} · ${c.company}` : c.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Notas (opcional)">
              <Input
                name="notes"
                placeholder="Detalles, referencia, etc."
                defaultValue={editing?.notes ?? ""}
              />
            </Field>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Guardar ingreso"}
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
    </>
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
