import { Loader2, Trash2, UsersRound } from "lucide-react";

import type { Dentist } from "@/types/dentist";

type DentistsListProps = {
  dentists: Dentist[];
  loading: boolean;
  deletingId: string | null;
  onDelete: (dentistId: string) => void;
};

export function DentistsList({
  dentists,
  loading,
  deletingId,
  onDelete,
}: DentistsListProps) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white/80 p-6">
      <div className="flex items-center gap-3">
        <UsersRound className="size-5 text-[var(--accent-dark)]" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Doctores registrados
          </p>
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            {dentists.length} doctores
          </h3>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm text-muted">
        {loading ? (
          <p>Cargando lista...</p>
        ) : dentists.length ? (
          <ul className="space-y-3">
            {dentists.map((dentist) => (
              <li
                key={dentist.id}
                className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      {dentist.name}
                    </p>
                    <p className="text-xs text-muted">
                      {dentist.email ?? "Sin correo registrado"}
                    </p>
                    {dentist.phone && (
                      <p className="text-xs text-muted">Tel: {dentist.phone}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(dentist.id)}
                    disabled={deletingId === dentist.id}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-[#c0392b] hover:text-[#c0392b] disabled:opacity-60 sm:w-auto"
                  >
                    {deletingId === dentist.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-3" />
                    )}
                    {deletingId === dentist.id ? "Eliminando" : "Eliminar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            Aún no registras doctores. Usa el formulario para añadir el primero.
          </p>
        )}
      </div>
    </article>
  );
}
