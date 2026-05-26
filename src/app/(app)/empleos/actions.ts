"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { advancePayDate } from "@/lib/jobs";
import type { JobStatus, PayFrequency } from "@/generated/prisma";

const FREQ = ["WEEKLY", "BIWEEKLY", "MONTHLY"] as const;
const STATUS = ["ACTIVE", "ENDED"] as const;
type Freq = (typeof FREQ)[number];
type Status = (typeof STATUS)[number];

function isFreq(v: string): v is Freq {
  return (FREQ as readonly string[]).includes(v);
}

export async function createJob(formData: FormData) {
  const user = await requireUser();

  const employer = String(formData.get("employer") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const salary = Number(formData.get("salary") ?? "");
  const frequencyRaw = String(formData.get("frequency") ?? "MONTHLY");
  const nextPayDateRaw = String(formData.get("nextPayDate") ?? "");
  const startDateRaw = String(formData.get("startDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!employer) throw new Error("Empleador requerido");
  if (!Number.isFinite(salary) || salary <= 0) throw new Error("Sueldo invalido");
  if (!nextPayDateRaw) throw new Error("Fecha del proximo pago requerida");

  const frequency: Freq = isFreq(frequencyRaw) ? frequencyRaw : "MONTHLY";

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email ?? "" },
  });

  await prisma.job.create({
    data: {
      ownerId: user.id,
      employer,
      position: position || null,
      salary,
      frequency: frequency as PayFrequency,
      nextPayDate: new Date(nextPayDateRaw),
      startDate: startDateRaw ? new Date(startDateRaw) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/", "layout");
}

export async function deleteJob(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.job.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/", "layout");
}

export async function toggleJobStatus(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const current = String(formData.get("status") ?? "ACTIVE");
  const newStatus: Status = current === "ACTIVE" ? "ENDED" : "ACTIVE";

  await prisma.job.updateMany({
    where: { id, ownerId: user.id },
    data: {
      status: newStatus as JobStatus,
      ...(newStatus === "ENDED" ? { endDate: new Date() } : { endDate: null }),
    },
  });

  revalidatePath("/", "layout");
}

/**
 * Registra el pago del salario:
 *  1. Crea un Income con la categoria "Empleo / Trabajo"
 *  2. Avanza nextPayDate al siguiente ciclo
 */
export async function registerJobPayment(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const job = await prisma.job.findFirst({
    where: { id, ownerId: user.id },
  });
  if (!job) throw new Error("Empleo no encontrado");

  const next = advancePayDate(job.nextPayDate, job.frequency);

  await prisma.$transaction([
    prisma.income.create({
      data: {
        ownerId: user.id,
        amount: job.salary,
        category: "Empleo / Trabajo",
        paymentMethod: "TRANSFER",
        date: job.nextPayDate,
        notes: job.position
          ? `${job.employer} · ${job.position}`
          : job.employer,
      },
    }),
    prisma.job.update({
      where: { id: job.id },
      data: { nextPayDate: next },
    }),
  ]);

  revalidatePath("/", "layout");
}
