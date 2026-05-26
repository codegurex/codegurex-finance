export function progressPct(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

/**
 * Cuanto necesitarias ahorrar por mes para llegar a la meta antes del deadline.
 * Si no hay deadline o el deadline ya paso, devuelve null.
 */
export function monthlyNeeded(
  current: number,
  target: number,
  deadline: Date | null,
): number | null {
  if (!deadline) return null;
  const remaining = target - current;
  if (remaining <= 0) return 0;
  const monthsLeft = monthsBetween(new Date(), deadline);
  if (monthsLeft <= 0) return null;
  return remaining / monthsLeft;
}

function monthsBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return ms / (1000 * 60 * 60 * 24 * 30.44);
}

export function daysUntilDeadline(deadline: Date | null): number | null {
  if (!deadline) return null;
  const ms = deadline.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
