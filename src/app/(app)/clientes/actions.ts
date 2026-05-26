"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import type { ClientStatus } from "@/generated/prisma";

const VALID_STATUS = ["ACTIVE", "INACTIVE", "ARCHIVED"] as const;
type Status = (typeof VALID_STATUS)[number];
function isStatus(v: string): v is Status {
  return (VALID_STATUS as readonly string[]).includes(v);
}

export async function createClientRecord(formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "ACTIVE");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) throw new Error("Nombre requerido");
  const status: Status = isStatus(statusRaw) ? statusRaw : "ACTIVE";

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email ?? "" },
  });

  await prisma.client.create({
    data: {
      ownerId: user.id,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      country: country || null,
      status: status as ClientStatus,
      notes: notes || null,
    },
  });

  revalidatePath("/clientes");
}

export async function updateClientRecord(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID requerido");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "ACTIVE");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) throw new Error("Nombre requerido");
  const status: Status = isStatus(statusRaw) ? statusRaw : "ACTIVE";

  await prisma.client.updateMany({
    where: { id, ownerId: user.id },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      country: country || null,
      status: status as ClientStatus,
      notes: notes || null,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteClientRecord(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.client.deleteMany({ where: { id, ownerId: user.id } });

  revalidatePath("/clientes");
}
