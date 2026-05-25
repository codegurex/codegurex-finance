"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { PaymentMethod } from "@/generated/prisma";

const VALID_METHODS = ["CASH", "TRANSFER", "STRIPE", "PAYPAL", "CRYPTO", "OTHER"] as const;
type Method = (typeof VALID_METHODS)[number];

function isMethod(v: string): v is Method {
  return (VALID_METHODS as readonly string[]).includes(v);
}

export async function createIncome(formData: FormData) {
  const user = await requireUser();

  const amountRaw = String(formData.get("amount") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "TRANSFER");
  const dateRaw = String(formData.get("date") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const clientIdRaw = String(formData.get("clientId") ?? "").trim();

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Monto invalido");
  }
  if (!category) throw new Error("Categoria requerida");
  const method: Method = isMethod(paymentMethod) ? paymentMethod : "TRANSFER";
  const date = dateRaw ? new Date(dateRaw) : new Date();

  // Asegura que el row de public.users exista (por si el trigger no corrio).
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email ?? "" },
  });

  // Verifica que el cliente pertenece al usuario antes de vincularlo.
  let clientId: string | null = null;
  if (clientIdRaw) {
    const owned = await prisma.client.findFirst({
      where: { id: clientIdRaw, ownerId: user.id },
      select: { id: true },
    });
    if (owned) clientId = owned.id;
  }

  await prisma.income.create({
    data: {
      ownerId: user.id,
      amount,
      category,
      paymentMethod: method as PaymentMethod,
      date,
      notes: notes || null,
      clientId,
    },
  });

  revalidatePath("/ingresos");
  revalidatePath("/");
}

export async function deleteIncome(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Verifica ownership antes de borrar.
  await prisma.income.deleteMany({
    where: { id, ownerId: user.id },
  });

  revalidatePath("/ingresos");
  revalidatePath("/");
}
