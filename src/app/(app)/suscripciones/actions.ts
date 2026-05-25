"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { SubscriptionFrequency, SubscriptionStatus } from "@/generated/prisma";

const FREQ = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
const STATUS = ["ACTIVE", "CANCELLED"] as const;
type Freq = (typeof FREQ)[number];
type Status = (typeof STATUS)[number];

export async function createSubscription(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const provider = String(formData.get("provider") ?? "").trim();
  const amount = Number(formData.get("amount") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const frequencyRaw = String(formData.get("frequency") ?? "MONTHLY");
  const nextRenewalRaw = String(formData.get("nextRenewal") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) throw new Error("Nombre requerido");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Monto invalido");
  if (!category) throw new Error("Categoria requerida");
  if (!nextRenewalRaw) throw new Error("Fecha de renovacion requerida");

  const frequency: Freq = (FREQ as readonly string[]).includes(frequencyRaw)
    ? (frequencyRaw as Freq)
    : "MONTHLY";

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email ?? "" },
  });

  await prisma.subscription.create({
    data: {
      ownerId: user.id,
      name,
      provider: provider || null,
      amount,
      category,
      frequency: frequency as SubscriptionFrequency,
      nextRenewal: new Date(nextRenewalRaw),
      notes: notes || null,
    },
  });

  revalidatePath("/suscripciones");
  revalidatePath("/");
}

export async function deleteSubscription(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.subscription.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/suscripciones");
  revalidatePath("/");
}

export async function toggleSubscriptionStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const currentStatus = String(formData.get("status") ?? "ACTIVE");
  const newStatus: Status = currentStatus === "ACTIVE" ? "CANCELLED" : "ACTIVE";

  await prisma.subscription.updateMany({
    where: { id, ownerId: user.id },
    data: { status: newStatus as SubscriptionStatus },
  });

  revalidatePath("/suscripciones");
  revalidatePath("/");
}

/**
 * Avanza nextRenewal segun la frecuencia. Util cuando se "renueva" una sub
 * (registra el pago de este ciclo y prepara la fecha del siguiente).
 */
export async function rolloverSubscription(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const sub = await prisma.subscription.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!sub) return;

  const next = new Date(sub.nextRenewal);
  switch (sub.frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { nextRenewal: next },
  });

  revalidatePath("/suscripciones");
  revalidatePath("/");
}
