import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { statusMeta } from "@/lib/projects";
import { ProjectForm } from "./project-form";
import { StatusSelect } from "./status-select";
import { deleteProject } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProyectosPage() {
  const user = await requireUser();

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { client: { select: { name: true, company: true } } },
    }),
    prisma.client.findMany({
      where: { ownerId: user.id, status: { not: "ARCHIVED" } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);

  const active = projects.filter(
    (p) => p.status !== "COMPLETED" && p.status !== "CANCELLED",
  );
  const activeValue = active.reduce((sum, p) => sum + Number(p.price), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
          <p className="text-sm text-muted-foreground">
            {active.length} activos · {formatCurrency(activeValue)} en pipeline
          </p>
        </div>
        <ProjectForm clients={clients} />
      </header>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            Sin proyectos. Crea el primero arriba.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Proyecto</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Progreso</th>
                  <th className="px-5 py-3 font-medium">Entrega</th>
                  <th className="px-5 py-3 text-right font-medium">Precio</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const meta = statusMeta(p.status);
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-5 py-3">
                        <div className="font-medium">{p.name}</div>
                        {p.service && (
                          <div className="text-xs text-muted-foreground">{p.service}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.client.company
                          ? `${p.client.name} · ${p.client.company}`
                          : p.client.name}
                      </td>
                      <td className="px-5 py-3">
                        <StatusSelect
                          projectId={p.id}
                          current={p.status}
                          className={meta.className}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {p.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.endDate ? formatDate(p.endDate) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatCurrency(Number(p.price))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <form action={deleteProject}>
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            className="text-muted-foreground hover:text-red-500"
                            aria-label="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
