export const INCOME_CATEGORIES = [
  "Desarrollo web",
  "Ciberseguridad",
  "Mantenimiento",
  "Diseno",
  "Hosting",
  "Automatizacion",
  "Consultoria",
  "Otro",
] as const;

export const EXPENSE_CATEGORIES = [
  "Hosting",
  "Dominios",
  "Software",
  "APIs",
  "Publicidad",
  "Internet",
  "Equipos",
  "Freelancers",
  "Otro",
] as const;

export const PAYMENT_METHODS = [
  { value: "TRANSFER", label: "Transferencia" },
  { value: "CASH", label: "Efectivo" },
  { value: "STRIPE", label: "Stripe" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "CRYPTO", label: "Cripto" },
  { value: "OTHER", label: "Otro" },
] as const;

export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"];
