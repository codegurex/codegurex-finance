"use client";

import { Select } from "@/components/ui/select";
import { PROJECT_STATUS_OPTIONS } from "@/lib/projects";
import { updateProjectStatus } from "./actions";

export function StatusSelect({
  projectId,
  current,
  className,
}: {
  projectId: string;
  current: string;
  className?: string;
}) {
  return (
    <form action={updateProjectStatus}>
      <input type="hidden" name="id" value={projectId} />
      <Select
        name="status"
        defaultValue={current}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`h-7 w-auto py-0 text-xs font-medium ${className ?? ""}`}
      >
        {PROJECT_STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </form>
  );
}
