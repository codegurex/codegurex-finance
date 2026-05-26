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

export async function createExpense(formData: FormData) {
  const user = await requireUser();

  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "TRANSFER");
  const provider = String(formData.get("provider") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const amount = Number(amountRaw);
  if (!description) throw new Error("Descripcion requerida");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Monto invalido");
  if (!category) throw new Error("Categoria requerida");
  const method: Method = isMethod(paymentMethod) ? paymentMethod : "TRANSFER";
  const date = dateRaw ? new Date(dateRaw) : new Date();

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email ?? "" },
  });

  await prisma.expense.create({
    data: {
      ownerId: user.id,
      description,
      amount,
      category,
      paymentMethod: method as PaymentMethod,
      provider: provider || null,
      date,
      notes: notes || null,
    },
  });

  revalidatePath("/", "layout");
}

export async function updateExpense(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID requerido");

  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "TRANSFER");
  const provider = String(formData.get("provider") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!description) throw new Error("Descripcion requerida");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Monto invalido");
  if (!category) throw new Error("Categoria requerida");
  const method: Method = isMethod(paymentMethod) ? paymentMethod : "TRANSFER";
  const date = dateRaw ? new Date(dateRaw) : new Date();

  await prisma.expense.updateMany({
    where: { id, ownerId: user.id },
    data: {
      description,
      amount,
      category,
      paymentMethod: method as PaymentMethod,
      provider: provider || null,
      date,
      notes: notes || null,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteExpense(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.expense.deleteMany({
    where: { id, ownerId: user.id },
  });

  revalidatePath("/", "layout");
}
