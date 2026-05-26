"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { createGoal, updateGoal } from "./actions";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activa" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export type GoalEditing = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  status: string;
  notes: string | null;
};

export function GoalForm({ editing }: { editing?: GoalEditing }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = !!editing;
  const defaultDeadline = editing?.deadline
    ? new Date(editing.deadline).toISOString().slice(0, 10)
    : "";

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (isEdit && editing) {
          formData.append("id", editing.id);
          await updateGoal(formData);
        } else {
          await createGoal(formData);
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
          <Pencil size={14} />
        </button>
      );
    }
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> Nueva meta
      </Button>
    );
  }

  return (
    <>
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
              {isEdit ? "Editar meta" : "Nueva meta de ahorro"}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </div>

          <Field label="Nombre">
            <Input
              name="name"
              required
              placeholder="Comprar laptop, fondo de emergencia..."
              defaultValue={editing?.name}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Objetivo (USD)">
              <Input
                name="targetAmount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="5000.00"
                defaultValue={editing?.targetAmount}
              />
            </Field>

            <Field label="Ya tengo ahorrado">
              <Input
                name="currentAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                defaultValue={editing?.currentAmount ?? 0}
              />
            </Field>

            <Field label="Fecha limite (opcional)">
              <Input name="deadline" type="date" defaultValue={defaultDeadline} />
            </Field>

            {isEdit && (
              <Field label="Estado">
                <Select name="status" defaultValue={editing?.status ?? "ACTIVE"}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>

          <Field label="Notas (opcional)">
            <Input
              name="notes"
              placeholder="Para que es esta meta?"
              defaultValue={editing?.notes ?? ""}
            />
          </Field>

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
                  : "Crear meta"}
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
