import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { ClientForm } from "./client-form";
import { deleteClientRecord } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Activo", className: "bg-green-100 text-green-700" },
  INACTIVE: { label: "Inactivo", className: "bg-zinc-100 text-zinc-600" },
  ARCHIVED: { label: "Archivado", className: "bg-red-100 text-red-700" },
};

export default async function ClientesPage() {
  const user = await requireUser();

  const clients = await prisma.client.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const activeCount = clients.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {clients.length} clientes · {activeCount} activos
          </p>
        </div>
        <ClientForm />
      </header>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            Sin clientes todavia. Agrega tu primer cliente arriba.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Empresa</th>
                  <th className="px-5 py-3 font-medium">Correo</th>
                  <th className="px-5 py-3 font-medium">Pais</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Alta</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => {
                  const status = STATUS_LABEL[c.status] ?? STATUS_LABEL.ACTIVE;
                  return (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-5 py-3 font-medium">{c.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.company ?? "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.email ?? "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{c.country ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <form action={deleteClientRecord}>
                          <input type="hidden" name="id" value={c.id} />
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
