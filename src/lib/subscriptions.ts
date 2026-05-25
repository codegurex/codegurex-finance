export const SUBSCRIPTION_CATEGORIES = [
  "Hosting",
  "Dominio",
  "Software",
  "API",
  "Cloud",
  "Otro",
] as const;

export const FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Semanal", days: 7 },
  { value: "MONTHLY", label: "Mensual", days: 30 },
  { value: "QUARTERLY", label: "Trimestral", days: 90 },
  { value: "YEARLY", label: "Anual", days: 365 },
] as const;

export function frequencyLabel(value: string) {
  return FREQUENCY_OPTIONS.find((f) => f.value === value)?.label ?? value;
}

/**
 * Normaliza un monto al equivalente mensual segun su frecuencia.
 */
export function toMonthly(amount: number, frequency: string): number {
  switch (frequency) {
    case "WEEKLY":
      return amount * (52 / 12);
    case "MONTHLY":
      return amount;
    case "QUARTERLY":
      return amount / 3;
    case "YEARLY":
      return amount / 12;
    default:
      return amount;
  }
}

/**
 * Dias entre hoy y una fecha futura. Negativo = vencido.
 */
export function daysUntil(date: Date): number {
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
