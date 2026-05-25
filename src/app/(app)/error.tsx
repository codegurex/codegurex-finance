"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

/**
 * Error boundary para las rutas del grupo (app).
 * Reemplaza la pagina generica "This page couldn't load" con un mensaje util.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log en cliente — en server ya quedo en el log de Next.
    console.error("App error:", error);
  }, [error]);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Algo salio mal</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {error.message || "Ocurrio un error inesperado al cargar esta seccion."}
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground/70">
              digest: {error.digest}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={reset}>
            <RefreshCw size={16} /> Reintentar
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Volver al dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
