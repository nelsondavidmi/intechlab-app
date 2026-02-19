import { Loader2, Trash2, UsersRound } from "lucide-react";

import type { Technician } from "@/types/technician";

type TechniciansListProps = {
  technicians: Technician[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (technicianId: string) => void;
};

export function TechniciansList({
  technicians,
  loading,
  deletingId,
  onDelete,
}: TechniciansListProps) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white/80 p-6">
      <div className="flex items-center gap-3">
        <UsersRound className="size-5 text-[var(--accent-dark)]" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Equipo registrado
          </p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {technicians.length} laboratoristas
          </h3>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted">
        {loading ? (
          <p>Cargando lista...</p>
        ) : technicians.length ? (
          <ul className="space-y-3">
            {technicians.map((tech) => (
              <li
                key={tech.id}
                className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {tech.name}
                    </p>
                    <p className="text-xs text-muted">
                      {tech.email ?? "Sin correo registrado"}
                    </p>
                    <p className="text-xs text-muted">
                      Rol:{" "}
                      {tech.role === "admin"
                        ? "Administrador"
                        : "Laboratorista"}
                    </p>
                    {tech.phone && (
                      <p className="text-xs text-muted">Tel: {tech.phone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(tech.id)}
                    disabled={deletingId === tech.id}
                    className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-[#c0392b] hover:text-[#c0392b] disabled:opacity-60"
                  >
                    {deletingId === tech.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                    {deletingId === tech.id ? "Eliminando" : "Eliminar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            Aún no registras laboratoristas. Usa el formulario para añadir el
            primero.
          </p>
        )}
      </div>
    </article>
  );
}
