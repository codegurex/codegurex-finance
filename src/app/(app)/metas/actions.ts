"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { GoalStatus } from "@/generated/prisma";

const VALID_STATUS = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;
type Status = (typeof VALID_STATUS)[number];
function isStatus(v: string): v is Status {
  return (VALID_STATUS as readonly string[]).includes(v);
}

export async function createGoal(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = Number(formData.get("targetAmount") ?? "");
  const currentAmount = Number(formData.get("currentAmount") ?? "0");
  const deadlineRaw = String(formData.get("deadline") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) throw new Error("Nombre requerido");
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error("Monto objetivo invalido");
  }
  if (!Number.isFinite(currentAmount) || currentAmount < 0) {
    throw new Error("Monto inicial invalido");
  }

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email ?? "" },
  });

  await prisma.goal.create({
    data: {
      ownerId: user.id,
      name,
      targetAmount,
      currentAmount,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/", "layout");
}

export async function updateGoal(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID requerido");

  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = Number(formData.get("targetAmount") ?? "");
  const currentAmount = Number(formData.get("currentAmount") ?? "0");
  const deadlineRaw = String(formData.get("deadline") ?? "");
  const statusRaw = String(formData.get("status") ?? "ACTIVE");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) throw new Error("Nombre requerido");
  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    throw new Error("Monto objetivo invalido");
  }
  const status: Status = isStatus(statusRaw) ? statusRaw : "ACTIVE";

  await prisma.goal.updateMany({
    where: { id, ownerId: user.id },
    data: {
      name,
      targetAmount,
      currentAmount,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      status: status as GoalStatus,
      notes: notes || null,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteGoal(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.goal.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/", "layout");
}

/**
 * Suma un aporte al currentAmount de la meta.
 * Si llega o supera el target, marca como COMPLETED.
 */
export async function contributeToGoal(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const amount = Number(formData.get("amount") ?? "");

  if (!id) return;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Monto invalido");
  }

  const goal = await prisma.goal.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!goal) throw new Error("Meta no encontrada");

  const newCurrent = Number(goal.currentAmount) + amount;
  const target = Number(goal.targetAmount);

  await prisma.goal.update({
    where: { id: goal.id },
    data: {
      currentAmount: newCurrent,
      status: newCurrent >= target ? "COMPLETED" : goal.status,
    },
  });

  revalidatePath("/", "layout");
}
