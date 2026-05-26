export const PAY_FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Semanal", perMonth: 52 / 12 },
  { value: "BIWEEKLY", label: "Quincenal", perMonth: 2 },
  { value: "MONTHLY", label: "Mensual", perMonth: 1 },
] as const;

export function payFrequencyLabel(value: string) {
  return PAY_FREQUENCY_OPTIONS.find((f) => f.value === value)?.label ?? value;
}

/**
 * Monto promedio mensual segun la frecuencia de pago.
 */
export function projectedMonthly(salary: number, frequency: string): number {
  const opt = PAY_FREQUENCY_OPTIONS.find((f) => f.value === frequency);
  return salary * (opt?.perMonth ?? 1);
}

/**
 * Avanza la fecha al siguiente pago segun la frecuencia.
 */
export function advancePayDate(date: Date, frequency: string): Date {
  const next = new Date(date);
  switch (frequency) {
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "BIWEEKLY":
      next.setDate(next.getDate() + 15);
      break;
    case "MONTHLY":
    default:
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

/**
 * Dias entre hoy y la proxima fecha de pago. Negativo = vencida.
 */
export function daysUntilPay(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
