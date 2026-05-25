"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PROJECT_STATUS_OPTIONS } from "@/lib/projects";
import { createProject } from "./actions";

type ClientOption = { id: string; name: string; company: string | null };

export function ProjectForm({ clients }: { clients: ClientOption[] }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createProject(formData);
        formRef.current?.reset();
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al guardar");
      }
    });
  }

  if (clients.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Necesitas al menos un{" "}
        <Link href="/clientes" className="underline">
          cliente
        </Link>{" "}
        para crear un proyecto.
      </div>
    );
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} /> Nuevo proyecto
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Nuevo proyecto</h2>
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
            <Input name="name" required placeholder="Landing page X" />
          </Field>

          <Field label="Cliente">
            <Select name="clientId" required defaultValue="">
              <option value="" disabled>
                Selecciona un cliente
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company ? `${c.name} · ${c.company}` : c.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Servicio">
            <Input name="service" placeholder="Desarrollo web, ciberseguridad..." />
          </Field>

          <Field label="Precio (USD)">
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="1500.00"
            />
          </Field>

          <Field label="Estado">
            <Select name="status" defaultValue="PENDING">
              {PROJECT_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Progreso (%)">
            <Input name="progress" type="number" min="0" max="100" defaultValue={0} />
          </Field>

          <Field label="Fecha inicio">
            <Input name="startDate" type="date" />
          </Field>

          <Field label="Fecha entrega">
            <Input name="endDate" type="date" />
          </Field>
        </div>

        <Field label="Notas (opcional)">
          <Input name="notes" placeholder="Alcance, observaciones..." />
        </Field>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando..." : "Guardar proyecto"}
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
