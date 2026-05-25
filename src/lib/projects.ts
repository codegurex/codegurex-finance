export const PROJECT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente", className: "bg-zinc-100 text-zinc-700" },
  { value: "IN_PROGRESS", label: "En desarrollo", className: "bg-blue-100 text-blue-700" },
  { value: "REVIEW", label: "Revision", className: "bg-amber-100 text-amber-700" },
  { value: "COMPLETED", label: "Completado", className: "bg-green-100 text-green-700" },
  { value: "CANCELLED", label: "Cancelado", className: "bg-red-100 text-red-700" },
] as const;

export function statusMeta(value: string) {
  return (
    PROJECT_STATUS_OPTIONS.find((s) => s.value === value) ?? PROJECT_STATUS_OPTIONS[0]
  );
}
