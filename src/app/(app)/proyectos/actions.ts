"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { ProjectStatus } from "@/generated/prisma";

const STATUSES = ["PENDING", "IN_PROGRESS", "REVIEW", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];
function isStatus(v: string): v is Status {
  return (STATUSES as readonly string[]).includes(v);
}

export async function createProject(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const service = String(formData.get("service") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "");
  const statusRaw = String(formData.get("status") ?? "PENDING");
  const progressRaw = String(formData.get("progress") ?? "0");
  const startDateRaw = String(formData.get("startDate") ?? "");
  const endDateRaw = String(formData.get("endDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) throw new Error("Nombre requerido");
  if (!clientId) throw new Error("Cliente requerido");
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) throw new Error("Precio invalido");
  const progress = Math.max(0, Math.min(100, Number(progressRaw) || 0));
  const status: Status = isStatus(statusRaw) ? statusRaw : "PENDING";

  // Verifica que el cliente pertenece al usuario.
  const owned = await prisma.client.findFirst({
    where: { id: clientId, ownerId: user.id },
    select: { id: true },
  });
  if (!owned) throw new Error("Cliente no encontrado");

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email ?? "" },
  });

  await prisma.project.create({
    data: {
      ownerId: user.id,
      clientId: owned.id,
      name,
      service: service || null,
      price,
      status: status as ProjectStatus,
      progress,
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      endDate: endDateRaw ? new Date(endDateRaw) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/proyectos");
}

export async function deleteProject(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.project.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/proyectos");
}

export async function updateProjectStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !isStatus(statusRaw)) return;

  await prisma.project.updateMany({
    where: { id, ownerId: user.id },
    data: {
      status: statusRaw as ProjectStatus,
      // Si pasa a completado, marca progreso 100.
      ...(statusRaw === "COMPLETED" ? { progress: 100 } : {}),
    },
  });

  revalidatePath("/proyectos");
}
