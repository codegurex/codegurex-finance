"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { createClientRecord, updateClientRecord } from "./actions";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
  { value: "ARCHIVED", label: "Archivado" },
];

export type ClientEditing = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  status: string;
  notes: string | null;
};

export function ClientForm({ editing }: { editing?: ClientEditing }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isEdit = !!editing;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (isEdit && editing) {
          formData.append("id", editing.id);
          await updateClientRecord(formData);
        } else {
          await createClientRecord(formData);
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
        <Plus size={16} /> Nuevo cliente
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
              {isEdit ? "Editar cliente" : "Nuevo cliente"}
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
            <Field label="Nombre">
              <Input
                name="name"
                required
                placeholder="Juan Perez"
                defaultValue={editing?.name}
              />
            </Field>

            <Field label="Empresa">
              <Input
                name="company"
                placeholder="Acme S.A."
                defaultValue={editing?.company ?? ""}
              />
            </Field>

            <Field label="Correo">
              <Input
                name="email"
                type="email"
                placeholder="contacto@empresa.com"
                defaultValue={editing?.email ?? ""}
              />
            </Field>

            <Field label="Telefono">
              <Input
                name="phone"
                placeholder="+593 ..."
                defaultValue={editing?.phone ?? ""}
              />
            </Field>

            <Field label="Pais">
              <Input
                name="country"
                placeholder="Ecuador"
                defaultValue={editing?.country ?? ""}
              />
            </Field>

            <Field label="Estado">
              <Select name="status" defaultValue={editing?.status ?? "ACTIVE"}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Notas (opcional)">
            <Input
              name="notes"
              placeholder="Servicios contratados, contexto, etc."
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
                  : "Guardar cliente"}
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
