"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PAY_FREQUENCY_OPTIONS } from "@/lib/jobs";
import { createJob } from "./actions";

export function JobForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Default: dentro de 30 dias (proxima nomina)
  const defaultPay = new Date();
  defaultPay.setDate(defaultPay.getDate() + 30);
  const defaultPayStr = defaultPay.toISOString().slice(0, 10);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createJob(formData);
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
        <Plus size={16} /> Nuevo empleo
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Nuevo empleo</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Empleador">
            <Input name="employer" required placeholder="Nombre de la empresa" />
          </Field>

          <Field label="Puesto (opcional)">
            <Input name="position" placeholder="Desarrollador, Pentester..." />
          </Field>

          <Field label="Sueldo (USD)">
            <Input
              name="salary"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="500.00"
            />
          </Field>

          <Field label="Frecuencia de pago">
            <Select name="frequency" defaultValue="MONTHLY" required>
              {PAY_FREQUENCY_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Proximo pago">
            <Input name="nextPayDate" type="date" defaultValue={defaultPayStr} required />
          </Field>

          <Field label="Fecha de inicio (opcional)">
            <Input name="startDate" type="date" />
          </Field>
        </div>

        <Field label="Notas (opcional)">
          <Input name="notes" placeholder="Contrato, observaciones..." />
        </Field>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar empleo"}
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
