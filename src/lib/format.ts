const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number | string) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return dateFormatter.format(date);
}
